using Disruptive_Advantage_Customization.Entities;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Disruptive_Advantage_Customization.BusinessLogicHelper
{
    public class Logic
    {
        public void JobDestinationVesselPreCreateLogic(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {
            if (context != null && context.InputParameters != null && context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity jobDestination = (Entity)context.InputParameters["Target"];
                var destVessel = jobDestination.GetAttributeValue<EntityReference>("dia_vessel");
                var jobRef = jobDestination.GetAttributeValue<EntityReference>("dia_job");
                var jobEnt = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));

                #region JobsToFill

                var JobDestinationLogic = new JobDestinationEntity();
                var vesselFills = JobDestinationLogic.GetDestinationVesselQuantity(service, jobDestination, destVessel, jobEnt);

                var logiHelper = new LogicHelper();
                var qtdFill = logiHelper.SumOfQuantities(vesselFills, "dia_quantity");

                #endregion JobsToFill

                #region JobsToEmpty

                var vessEmpty = JobDestinationLogic.GetSourceVesselQuantity(service, jobDestination, destVessel, jobEnt);
                var qtdDrop = logiHelper.SumOfQuantities(vessEmpty, "dia_quantity");

                #endregion JobsToEmpty

                var vesselEnt = service.Retrieve("dia_vessel", destVessel.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name", "dia_remainingcapacity"));
                var occVessel = vesselEnt.GetAttributeValue<decimal>("dia_occupation");
                var capVessel = vesselEnt.GetAttributeValue<decimal>("dia_capacity");
                var qtdJobDestVessel = jobDestination.GetAttributeValue<decimal>("dia_quantity");


                var finalOccupation = logiHelper.FinalOccupation(capVessel, occVessel, qtdJobDestVessel, qtdFill, qtdDrop);

                tracingService.Trace("capVessel: " + capVessel);
                tracingService.Trace("occVessel: " + occVessel);
                tracingService.Trace("qtdJobDestVessel: " + qtdJobDestVessel);
                tracingService.Trace("qtdFill: " + qtdFill);
                tracingService.Trace("qtdDrop: " + qtdDrop);
                tracingService.Trace("finalOccupation: " + finalOccupation);
                if (finalOccupation < 0)
                    throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + " will not have that capacity, will exceeed in " + finalOccupation);

                #region different actions

                var JobSourceLogic = new JobSourceEntity();
                var vesselAsDestination = JobSourceLogic.GetVesselJobAsDestination(service, destVessel, jobEnt);



                var plannedvesselOccupation = logiHelper.VesselOccupation(vesselAsDestination);

                tracingService.Trace("vessel Occupation: " + plannedvesselOccupation);

                var vesselOccupation = vesselEnt.GetAttributeValue<decimal>("dia_occupation");
                var vesselCapacity = vesselEnt.GetAttributeValue<decimal>("dia_capacity");

                var JobEntity = jobDestination.GetAttributeValue<EntityReference>("dia_job");
                var JobInfo = service.Retrieve(jobRef.LogicalName, JobEntity.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));
                var jobtype = JobInfo.GetAttributeValue<OptionSetValue>("dia_type") != null ? JobInfo.GetAttributeValue<OptionSetValue>("dia_type") : null;

                if (jobtype != null && (jobtype.Value == 914440002 || jobtype.Value == 914440001)) // if job type intake or transfer
                {
                    if (jobDestination.GetAttributeValue<decimal>("dia_quantity") > vesselCapacity)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " does not have enough capacity. Max. Capacity: " + Decimal.ToInt32(vesselCapacity) + "L");
                    }
                    if (plannedvesselOccupation != 0 && jobtype.Value != 914440001)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + " is not empty");
                    }
                    if (vesselOccupation > 0 && jobtype.Value != 914440001)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + " is not empty");
                    }
                }

                if (jobtype != null && jobtype.Value == 914440000 || jobtype.Value == 914440003) //In-Situ && Dispatch
                { //if job type in-situ or dispatch +
                    if (plannedvesselOccupation <= 0)
                    {
                        throw new InvalidPluginExecutionException("The vessel" + vesselEnt["dia_name"] + "at this date " + jobEnt["dia_schelduledstart"] + " is empty");
                    }
                }


                #endregion

                #region Update Blend

                var prevolume = jobDestination.GetAttributeValue<decimal>("dia_prevolume");


                if (jobtype != null && jobtype.Value == 914440001 && prevolume > 0) //transfer
                {
                    jobDestination.Attributes["dia_blend"] = true;
                }
                else if (prevolume <= 0)
                {

                    jobDestination.Attributes["dia_blend"] = false;

                }


                #endregion 
            }
        }
        public void JobSourceVesselPostCreate(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {
            if (context != null && context.InputParameters != null && context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity job = (Entity)context.InputParameters["Target"];

                var jobRef = (EntityReference)job["dia_job"];
                var jobType = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_type", "dia_quantity"));
                decimal? sumQuantity = new decimal();

                if (jobType.FormattedValues["dia_type"] == "Dispatch" || jobType.FormattedValues["dia_type"] == "Transfer/Blend")
                {
                    var JobSourceLogic = new JobSourceEntity();
                    var resultsquery = JobSourceLogic.GetJobSourceVessel(service, jobRef);

                    var logiHelper = new LogicHelper();
                    sumQuantity = logiHelper.SumOfQuantities(resultsquery, "dia_quantity");

                    var jobUpdate = new Entity(jobRef.LogicalName, jobRef.Id);
                    jobUpdate.Attributes["dia_quantity"] = sumQuantity;
                    service.Update(jobUpdate);
                }
            }
        }
        public void JobPostUpdateStarted(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {
            if (context != null && context.InputParameters != null && context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity targetEntity = (Entity)context.InputParameters["Target"];
                if (targetEntity.Contains("statuscode") && targetEntity.GetAttributeValue<OptionSetValue>("statuscode").Value == 914440002)//Started (In progress)
                {
                    var jobType = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_type"));
                    if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440000)//in-situ
                    {
                        tracingService.Trace("Inside Start3");
                        var query = new QueryExpression("dia_job");
                        query.ColumnSet.AddColumns("dia_jobid");
                        query.Criteria.AddCondition("dia_jobid", ConditionOperator.Equal, targetEntity.Id);
                        var query_dia_jobdestinationvessel = query.AddLink("dia_jobdestinationvessel", "dia_jobid", "dia_job");
                        query_dia_jobdestinationvessel.Columns.AddColumns("dia_vessel");
                        var query_dia_jobdestinationvessel_dia_vessel = query_dia_jobdestinationvessel.AddLink("dia_vessel", "dia_vessel", "dia_vesselid");
                        query_dia_jobdestinationvessel_dia_vessel.Columns.AddColumns("dia_occupation", "dia_name");
                        query_dia_jobdestinationvessel_dia_vessel.EntityAlias = "vessel";

                        EntityCollection queryResults = service.RetrieveMultiple(query);

                        if (queryResults.Entities.Count == 1)
                        {
                            var results = queryResults.Entities[0];
                            if (Convert.ToDecimal(results.GetAttributeValue<AliasedValue>("vessel.dia_occupation").Value) <= 0)
                            {
                                var vesselName = results.GetAttributeValue<AliasedValue>("vessel.dia_name").Value.ToString();
                                throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselName + " at this date " + DateTime.Now.ToShortDateString().ToString() + " is empty");
                            }
                        }
                    }
                }
            }
        }
        public void JobPostUpdateCompleted(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {

            if (context != null && context.InputParameters != null && context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity targetEntity = (Entity)context.InputParameters["Target"];

                #region update job status reason = completed
                if (targetEntity.Contains("statuscode") && targetEntity.GetAttributeValue<OptionSetValue>("statuscode").Value == 914440005)//Completed
                {
                    var jobType = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_type"));
                    if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440002)//intake
                    {
                        var statuscode = targetEntity.GetAttributeValue<OptionSetValue>("statuscode");
                        var quantity = targetEntity.GetAttributeValue<decimal?>("dia_quantity") == null ? 0 : targetEntity.GetAttributeValue<decimal>("dia_quantity");
                        var jobInformation = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_batch"));
                        var batchComposition = jobInformation != null && jobInformation.Contains("dia_batch") ? service.Retrieve(jobInformation.GetAttributeValue<EntityReference>("dia_batch").LogicalName, jobInformation.GetAttributeValue<EntityReference>("dia_batch").Id, new ColumnSet("dia_batchcomposition")) : null;

                        var JobLogic = new JobEntity();
                        EntityCollection resultsquery = JobLogic.GetDestinationQuantity(service, targetEntity);

                        foreach (var destinationVessel in resultsquery.Entities)
                        {
                            if (destinationVessel.GetAttributeValue<EntityReference>("dia_vessel") != null)
                            {
                                var vesselInformation = service.Retrieve(destinationVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, destinationVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition", "dia_location", "dia_stage"));
                                var stage = destinationVessel.GetAttributeValue<EntityReference>("dia_stage") == null ? null : destinationVessel.GetAttributeValue<EntityReference>("dia_stage");
                                tracingService.Trace("stage: " + stage);
                                var sourceVesselUpdate = new Entity(vesselInformation.LogicalName);
                                sourceVesselUpdate.Id = vesselInformation.Id;
                                sourceVesselUpdate.Attributes["dia_occupation"] = vesselInformation.GetAttributeValue<decimal>("dia_occupation") + destinationVessel.GetAttributeValue<decimal>("dia_quantity"); // ocupação do vessel + quantity do job destination vessel.
                                sourceVesselUpdate.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                                sourceVesselUpdate.Attributes["dia_composition"] = batchComposition != null ? batchComposition.GetAttributeValue<EntityReference>("dia_batchcomposition") : null; //Composition que vem do batch     
                                sourceVesselUpdate.Attributes["dia_stage"] = stage;


                                service.Update(sourceVesselUpdate);

                                CreateTransaction(service, tracingService, vesselInformation, jobInformation, destinationVessel, stage);
                            }
                            //update statuscode job destination vessel para completed
                            var vesselUpdate = new Entity(destinationVessel.LogicalName);
                            vesselUpdate.Id = destinationVessel.Id;
                            vesselUpdate.Attributes["statecode"] = new OptionSetValue(1); //Inactive
                            vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440002);//Completed
                            vesselUpdate.Attributes["dia_postvolume"] = destinationVessel.GetAttributeValue<decimal>("dia_quantity") + destinationVessel.GetAttributeValue<decimal>("dia_prevolume");
                            service.Update(vesselUpdate);
                        }
                    }
                    if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440001)//transfer
                    {
                        var jobInformation = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_batch"));
                        var batchComposition = jobInformation != null && jobInformation.Contains("dia_batch") ? service.Retrieve(jobInformation.GetAttributeValue<EntityReference>("dia_batch").LogicalName, jobInformation.GetAttributeValue<EntityReference>("dia_batch").Id, new ColumnSet("dia_batchcomposition")) : null;
                        //Quando o job fica completed passar o conteúdo do source vessel para o destination vessel. Ainda não está implementado destination vessel, só no source.

                        #region Update Destination Vessel Quantity and Composition

                        var JobLogic = new JobEntity();
                        EntityCollection resultsQueryJobDestinationVessel = JobLogic.GetDestinationQuantity(service, targetEntity);

                        tracingService.Trace("results Count: " + resultsQueryJobDestinationVessel.Entities.Count);

                        foreach (var jobdestinationvessel in resultsQueryJobDestinationVessel.Entities)
                        {
                            var vesselInformation = service.Retrieve(jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition", "dia_location", "dia_stage"));
                            var stage = jobdestinationvessel.GetAttributeValue<EntityReference>("dia_stage") == null ? null : jobdestinationvessel.GetAttributeValue<EntityReference>("dia_stage");

                            EntityCollection resultsQuantitySourceVessel = JobLogic.GetSourceQuantity(service, targetEntity);
                            var finalBatch = GetHighestQuantityBatch(service, resultsQuantitySourceVessel, jobdestinationvessel);

                            var destinationVesselUpdate = new Entity(vesselInformation.LogicalName);
                            destinationVesselUpdate.Id = vesselInformation.Id;
                            destinationVesselUpdate.Attributes["dia_occupation"] = jobdestinationvessel.GetAttributeValue<decimal>("dia_quantity") + vesselInformation.GetAttributeValue<decimal>("dia_occupation");
                            //destinationVesselUpdate.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                            tracingService.Trace("batch: " + jobdestinationvessel.GetAttributeValue<EntityReference>("dia_batch"));
                            //destinationVesselUpdate.Attributes["dia_batch"] = jobdestinationvessel != null ? jobdestinationvessel.GetAttributeValue<EntityReference>("dia_batch") : null;
                            destinationVesselUpdate.Attributes["dia_batch"] = finalBatch;
                            destinationVesselUpdate.Attributes["dia_composition"] = batchComposition != null ? batchComposition.GetAttributeValue<EntityReference>("dia_batchcomposition") : null;
                            destinationVesselUpdate.Attributes["dia_stage"] = stage;

                            service.Update(destinationVesselUpdate);

                            CreateTransaction(service, tracingService, vesselInformation, jobInformation, jobdestinationvessel, stage);

                            #region Update jobdestinationvessel statuscode and postvolume
                            var vesselUpdate = new Entity(jobdestinationvessel.LogicalName);
                            vesselUpdate.Id = jobdestinationvessel.Id;
                            vesselUpdate.Attributes["statecode"] = new OptionSetValue(1); //Inactive
                            vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440002);//Completed
                            vesselUpdate.Attributes["dia_postvolume"] = jobdestinationvessel.GetAttributeValue<decimal>("dia_quantity") + jobdestinationvessel.GetAttributeValue<decimal>("dia_prevolume");
                            service.Update(vesselUpdate);
                            #endregion

                            CreateDestinationVesselAdditives(service, tracingService, vesselInformation, targetEntity);
                        }
                        #endregion

                        #region Update Source Vessel Quantity and Composition

                        EntityCollection resultsSourceVessel = JobLogic.GetSourceQuantity(service, targetEntity);

                        foreach (var sourceVessel in resultsSourceVessel.Entities)
                        {
                            if (sourceVessel.GetAttributeValue<EntityReference>("dia_vessel") != null)
                            {
                                var vesselInformation = service.Retrieve(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition", "dia_location", "dia_stage"));
                                var stage = sourceVessel.GetAttributeValue<EntityReference>("dia_stage") == null ? null : sourceVessel.GetAttributeValue<EntityReference>("dia_stage");

                                var sourceVesselUpdate = new Entity(vesselInformation.LogicalName);
                                sourceVesselUpdate.Id = vesselInformation.Id;
                                tracingService.Trace("vessel occupation: " + vesselInformation.GetAttributeValue<decimal>("dia_occupation"));
                                tracingService.Trace("source vessel occupation: " + sourceVessel.GetAttributeValue<decimal>("dia_quantity"));
                                sourceVesselUpdate.Attributes["dia_occupation"] = vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity");
                                //se o vessel ficar vazio eliminar lookup para batch e composition
                                if (vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity") == 0)
                                {
                                    sourceVesselUpdate.Attributes["dia_batch"] = null;
                                    sourceVesselUpdate.Attributes["dia_composition"] = null;
                                }

                                service.Update(sourceVesselUpdate);

                                UpdateSourceVesselAdditives(service, tracingService, vesselInformation.GetAttributeValue<decimal>("dia_occupation"), sourceVessel.GetAttributeValue<decimal>("dia_quantity"), vesselInformation.ToEntityReference());

                                CreateTransaction(service, tracingService, vesselInformation, jobInformation, sourceVessel, stage);
                            }
                            var jobSourceVesselUpdate = new Entity(sourceVessel.LogicalName);
                            jobSourceVesselUpdate.Id = sourceVessel.Id;
                            jobSourceVesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440002);//Completed
                            jobSourceVesselUpdate.Attributes["statecode"] = new OptionSetValue(1); //Inactive
                            service.Update(jobSourceVesselUpdate);
                        }

                        #endregion
                    }

                    if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440003)//dispatch
                    {
                        var jobInformation = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_batch"));
                        var batchComposition = jobInformation != null && jobInformation.Contains("dia_batch") ? service.Retrieve(jobInformation.GetAttributeValue<EntityReference>("dia_batch").LogicalName, jobInformation.GetAttributeValue<EntityReference>("dia_batch").Id, new ColumnSet("dia_batchcomposition")) : null;


                        #region Update Source Vessel

                        var JobLogic = new JobEntity();
                        EntityCollection resultsSourceVessel = JobLogic.GetSourceQuantity(service, targetEntity);

                        foreach (var sourceVessel in resultsSourceVessel.Entities)
                        {
                            if (sourceVessel.GetAttributeValue<EntityReference>("dia_vessel") != null)
                            {
                                var vesselInformation = service.Retrieve(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition", "dia_location", "dia_stage"));
                                var stage = sourceVessel.GetAttributeValue<EntityReference>("dia_stage") == null ? null : sourceVessel.GetAttributeValue<EntityReference>("dia_stage");

                                var sourceVesselUpdate = new Entity(vesselInformation.LogicalName);
                                sourceVesselUpdate.Id = vesselInformation.Id;
                                sourceVesselUpdate.Attributes["dia_occupation"] = vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity");
                                //se o vessel ficar vazio eliminar lookup para batch e composition
                                if (vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity") == 0)
                                {
                                    sourceVesselUpdate.Attributes["dia_batch"] = null;
                                    sourceVesselUpdate.Attributes["dia_composition"] = null;
                                }
                                service.Update(sourceVesselUpdate);

                                CreateTransaction(service, tracingService, vesselInformation, jobInformation, sourceVessel, stage);
                                #endregion
                            }
                        }
                    }
                    if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440000)// in-situ
                    {
                        var jobInformation = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_batch"));
                        var batchComposition = jobInformation != null && jobInformation.Contains("dia_batch") ? service.Retrieve(jobInformation.GetAttributeValue<EntityReference>("dia_batch").LogicalName, jobInformation.GetAttributeValue<EntityReference>("dia_batch").Id, new ColumnSet("dia_batchcomposition")) : null;

                        #region Update Destination Vessel Additives

                        var JobLogic = new JobEntity();
                        EntityCollection resultsQueryJobDestinationVessel = JobLogic.GetDestinationQuantity(service, targetEntity);

                        foreach (var jobDestinationVessel in resultsQueryJobDestinationVessel.Entities)
                        {
                            EntityCollection queryJobAdditiveResults = JobLogic.GetAdditive(service, targetEntity);

                            foreach (var jobAdditive in queryJobAdditiveResults.Entities)
                            {
                                var jobAdditiveUpdate = new Entity(jobAdditive.LogicalName);
                                jobAdditiveUpdate.Id = jobAdditive.Id;
                                jobAdditiveUpdate.Attributes["dia_vessel"] = jobDestinationVessel.Contains("dia_vessel") == true ? jobDestinationVessel.GetAttributeValue<EntityReference>("dia_vessel") : null;

                                service.Update(jobAdditiveUpdate);
                            }
                            if (jobDestinationVessel.GetAttributeValue<EntityReference>("dia_stage") != null)
                            {
                                var stage = jobDestinationVessel.GetAttributeValue<EntityReference>("dia_stage") == null ? null : jobDestinationVessel.GetAttributeValue<EntityReference>("dia_stage");
                                var vessel = jobDestinationVessel.GetAttributeValue<EntityReference>("dia_vessel") == null ? null : jobDestinationVessel.GetAttributeValue<EntityReference>("dia_vessel");

                                var VesselUpdate = new Entity(vessel.LogicalName);
                                VesselUpdate.Id = vessel.Id;
                                VesselUpdate.Attributes["dia_stage"] = stage;

                                service.Update(VesselUpdate);
                            }
                        }

                        #endregion
                    }
                }
                #endregion
            }
        }
        public void UpdateSourceVesselAdditives(IOrganizationService service, ITracingService tracingService, decimal vesselCurrentOccupation, decimal vesselQuantitytoRemove, EntityReference vesselId)
        {
            var JobLogic = new JobEntity();
            EntityCollection jobAdditives = JobLogic.GetAdditiveVessel(service, vesselId);

            decimal removedPercentage = vesselQuantitytoRemove / vesselCurrentOccupation;

            foreach (var additive in jobAdditives.Entities)
            {
                if (removedPercentage == 1) service.Delete(additive.LogicalName, additive.Id);
                else
                {
                    var additiveQuantity = additive.GetAttributeValue<decimal>("dia_quantity");

                    additive.Attributes["dia_quantity"] = additiveQuantity * removedPercentage;
                    service.Update(additive);
                }
            }
        }
        public void CreateDestinationVesselAdditives(IOrganizationService service, ITracingService tracingService, Entity destinationVesselInformation, Entity targetEntity)
        {
            var JobLogic = new JobEntity();
            EntityCollection resultsSourceVessel = JobLogic.GetSourceQuantity(service, targetEntity);

            foreach (var sourceVessel in resultsSourceVessel.Entities)
            {
                var vesselInformation = service.Retrieve(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition", "dia_location", "dia_stage"));
                var vesselInfo = sourceVessel.GetAttributeValue<EntityReference>("dia_vessel");
                var jobSourceVesselQuantity = sourceVessel.GetAttributeValue<decimal>("dia_quantity");
                var removedPercentage = 1 - (jobSourceVesselQuantity / vesselInformation.GetAttributeValue<decimal>("dia_occupation"));
                EntityCollection jobAdditives = JobLogic.GetAdditiveVessel(service, vesselInfo);

                foreach (var additive in jobAdditives.Entities)
                {
                    var createAdditive = new Entity(additive.LogicalName);
                    createAdditive.Attributes["dia_quantity"] = additive.GetAttributeValue<decimal>("dia_quantity") * removedPercentage;
                    createAdditive.Attributes["dia_vessel"] = new EntityReference(destinationVesselInformation.LogicalName, destinationVesselInformation.Id);
                    createAdditive.Attributes["dia_jobid"] = additive.GetAttributeValue<EntityReference>("dia_jobid");
                    createAdditive.Attributes["dia_additiveid"] = additive.GetAttributeValue<EntityReference>("dia_additiveid");

                    service.Create(createAdditive);
                }
            }
        }
        public void BatchPostUpdate(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {

            Entity BatchEntity = (Entity)context.InputParameters["Target"];

            if (BatchEntity.Contains("statuscode") && BatchEntity.GetAttributeValue<OptionSetValue>("statuscode") != null)
            {
                var Batch = BatchEntity.GetAttributeValue<EntityReference>("dia_batch");
                var statuscodebatch = BatchEntity.GetAttributeValue<OptionSetValue>("statuscode");
                var statecodebatch = BatchEntity.GetAttributeValue<OptionSetValue>("statecode");

                if (statuscodebatch != null && statuscodebatch.Value == 914440003)
                { //Active 
                    var BatchStateCodeUpdate = new Entity(BatchEntity.LogicalName);
                    BatchStateCodeUpdate.Id = BatchEntity.Id;
                    BatchStateCodeUpdate.Attributes["statecode"] = new OptionSetValue(0);//Active
                    service.Update(BatchStateCodeUpdate);

                }
                else if (statuscodebatch != null && statuscodebatch.Value == 914440004)//Inactive
                {
                    var BatchStateCodeUpdate = new Entity(BatchEntity.LogicalName);
                    BatchStateCodeUpdate.Id = BatchEntity.Id;
                    BatchStateCodeUpdate.Attributes["statecode"] = new OptionSetValue(1); //Inactive
                    service.Update(BatchStateCodeUpdate);

                }
            }
        }

        public void CreateTransaction(IOrganizationService service, ITracingService tracingService, Entity vesselInformation, Entity jobInformation, Entity destinationVessel, EntityReference stage)
        {
            var createTransaction = new Entity("dia_vesselstocktransactions");
            createTransaction.Attributes["dia_location"] = vesselInformation.Contains("dia_location") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_location") : null;
            createTransaction.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
            createTransaction.Attributes["dia_vessel"] = destinationVessel.GetAttributeValue<EntityReference>("dia_vessel");
            createTransaction.Attributes["dia_stage"] = stage;
            createTransaction.Attributes["dia_quantity"] = destinationVessel.GetAttributeValue<decimal>("dia_quantity");
            createTransaction.Attributes["dia_referencetype"] = new OptionSetValue(914440000);

            service.Create(createTransaction);
        }

        public void JobSourceVesselPostUpdate(IOrganizationService service, ITracingService tracingService, IPluginExecutionContext context)
        {
            Entity JobSourceVessel = (Entity)context.InputParameters["Target"];
            Entity preImageEntity = (Entity)context.PreEntityImages["PreImage"];

            if (JobSourceVessel.Contains("dia_quantity") && JobSourceVessel.GetAttributeValue<decimal>("dia_quantity") != null)
            {

                var quantity = JobSourceVessel.GetAttributeValue<decimal>("dia_quantity");
                var JobEntity = service.Retrieve(JobSourceVessel.LogicalName, JobSourceVessel.Id, new ColumnSet("dia_job"));
                var jobId = JobEntity.Contains("dia_job") && JobEntity.GetAttributeValue<EntityReference>("dia_job") != null ? JobEntity.GetAttributeValue<EntityReference>("dia_job").Id : new Guid();
                var quantityJob = service.Retrieve("dia_job", jobId, new ColumnSet("dia_quantity")).GetAttributeValue<decimal>("dia_quantity");
                var JobType = service.Retrieve(JobEntity.GetAttributeValue<EntityReference>("dia_job").LogicalName, JobEntity.GetAttributeValue<EntityReference>("dia_job").Id, new ColumnSet("dia_type"));
                var quantityPreImage = preImageEntity.GetAttributeValue<decimal>("dia_quantity");
                var finalQuantity = quantity - quantityPreImage;

                if (JobType != null && JobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440003 || JobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440001) //dispatch And Transfer/blend
                {
                    var JobQuantityUpdate = new Entity(JobType.LogicalName);
                    JobQuantityUpdate.Id = jobId;
                    JobQuantityUpdate.Attributes["dia_quantity"] = finalQuantity + quantityJob;
                    service.Update(JobQuantityUpdate);
                }



            }


        }

        public void PostCreateRegionVintageVariety(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {

            Entity target = (Entity)context.InputParameters["Target"];

            var entityName = context.PrimaryEntityName;
            var fieldName = "";

            if (entityName == "dia_variety") fieldName = "dia_varietypercentage";
            else if (entityName == "dia_vintage") fieldName = "dia_vintagepercentage";
            else if (entityName == "dia_region") fieldName = "dia_regionpercentage";

            //updateBatchCompositionDetail(service, tracingService, fieldName, target);

        }
        public void updateBatchCompositionDetail(IOrganizationService service, ITracingService tracingService, string fieldName, Entity target)
        {
            var targetPercentage = target.GetAttributeValue<decimal>(fieldName);

            var batchCompositionPercentage = target.GetAttributeValue<EntityReference>("dia_batchcompositiondetail");
        }
        public EntityReference GetHighestQuantityBatch(IOrganizationService service, EntityCollection resultsQuantitySourceVessel, Entity jobdestinationvessel)
        {
            var vessel = jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel");
            var vesselInfo = vessel != null ? service.Retrieve(vessel.LogicalName, vessel.Id, new ColumnSet("dia_batch")) : null;
            var vesselBatch = vesselInfo != null && vesselInfo.Contains("dia_batch") ? vesselInfo.GetAttributeValue<EntityReference>("dia_batch") : null;

            decimal higherQuantity = jobdestinationvessel.GetAttributeValue<decimal>("dia_prevolume");

            foreach (var sourceVessel in resultsQuantitySourceVessel.Entities)
            {
                var sourceVesselQuantity = sourceVessel.GetAttributeValue<decimal>("dia_quantity");
                if (sourceVesselQuantity > higherQuantity)
                {
                    higherQuantity = sourceVesselQuantity;
                    vesselBatch = sourceVessel.GetAttributeValue<EntityReference>("dia_batch");
                }
            }
            return vesselBatch;
        }
    }
}
