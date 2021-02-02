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

                var vesselEnt = service.Retrieve("dia_vessel", destVessel.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name"));
                var occVessel = vesselEnt.GetAttributeValue<decimal>("dia_occupation");
                var capVessel = vesselEnt.GetAttributeValue<decimal>("dia_capacity");
                var qtdJobDestVessel = jobDestination.GetAttributeValue<decimal>("dia_quantity");


                var finalOccupation = logiHelper.FinalOccupation(capVessel, occVessel, qtdJobDestVessel, qtdFill, qtdDrop);

                if (finalOccupation < 0)
                    throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + " will not have that capacity, will exceeed in " + finalOccupation);

                #region different actions

                var VesselEntity = jobDestination.GetAttributeValue<EntityReference>("dia_vessel");
                var vesselInfo = service.Retrieve("dia_vessel", VesselEntity.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name", "dia_remainingcapacity"));
                var vesselOccupation = vesselInfo.GetAttributeValue<decimal>("dia_occupation");
                var vesselCapacity = vesselInfo.GetAttributeValue<decimal>("dia_capacity");

                var JobEntity = jobDestination.GetAttributeValue<EntityReference>("dia_job");
                var JobInfo = service.Retrieve(jobRef.LogicalName, JobEntity.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));
                var jobtype = JobInfo.GetAttributeValue<OptionSetValue>("dia_type") != null ? JobInfo.GetAttributeValue<OptionSetValue>("dia_type") : null;

                if (jobtype != null && jobtype.Value == 914440002) // if job type intake
                {
                    if (jobDestination.GetAttributeValue<decimal>("dia_quantity") > vesselCapacity)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " does not have enough capacity. Max. Capacity: " + Decimal.ToInt32(vesselCapacity) + "L");
                    }
                    if (vesselOccupation != 0)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + "is full");
                    }
                }

                if (jobtype != null && jobtype.Value == 914440000 || jobtype.Value == 914440003)
                { //if job type in-situ or dispatch +
                    if (vesselOccupation == 0)
                    {
                        throw new InvalidPluginExecutionException("The vessel" + vesselEnt["dia_name"] + " is empty");
                    }
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

                if (jobType.FormattedValues["dia_type"] == "Dispatch")
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

        public void JobPostUpdate(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {

            if (context != null && context.InputParameters != null && context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity targetEntity = (Entity)context.InputParameters["Target"];

                #region update  job status reason = completed
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

                                var sourceVesselUpdate = new Entity(vesselInformation.LogicalName);
                                sourceVesselUpdate.Id = vesselInformation.Id;
                                sourceVesselUpdate.Attributes["dia_occupation"] = vesselInformation.GetAttributeValue<decimal>("dia_occupation") + destinationVessel.GetAttributeValue<decimal>("dia_quantity"); // ocupação do vessel + quantity do job destination vessel.
                                sourceVesselUpdate.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                                sourceVesselUpdate.Attributes["dia_composition"] = batchComposition != null ? batchComposition.GetAttributeValue<EntityReference>("dia_batchcomposition") : null; //Composition que vem do batch

                                service.Update(sourceVesselUpdate);

                                #region Create Transaction
                                var createTransaction = new Entity("dia_vesselstocktransactions");
                                createTransaction.Attributes["dia_location"] = vesselInformation.Contains("dia_location") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_location") : null;
                                createTransaction.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                                createTransaction.Attributes["dia_vessel"] = destinationVessel.GetAttributeValue<EntityReference>("dia_vessel");
                                createTransaction.Attributes["dia_stage"] = vesselInformation.Contains("dia_stage") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_stage") : null;
                                createTransaction.Attributes["dia_quantity"] = destinationVessel.GetAttributeValue<decimal>("dia_quantity");
                                createTransaction.Attributes["dia_referencetype"] = new OptionSetValue(914440000);

                                service.Create(createTransaction);

                                #endregion
                            }
                            //update statuscode job destination vessel para completed
                            var vesselUpdate = new Entity(destinationVessel.LogicalName);
                            vesselUpdate.Id = destinationVessel.Id;
                            vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);//Completed
                            service.Update(vesselUpdate);
                        }
                    }
                    if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440001)//transfer
                    {
                        var jobInformation = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_batch"));
                        var batchComposition = jobInformation != null && jobInformation.Contains("dia_batch") ? service.Retrieve(jobInformation.GetAttributeValue<EntityReference>("dia_batch").LogicalName, jobInformation.GetAttributeValue<EntityReference>("dia_batch").Id, new ColumnSet("dia_batchcomposition")) : null;
                        //Quando o job fica completed passar o conteúdo do source vessel para o destination vessel. Ainda não está implementado destination vessel, só no source.
                        #region Update Source Vessel Quantity and Composition

                        var querySourceVessel = new QueryExpression("dia_jobsourcevessel");
                        querySourceVessel.ColumnSet.AddColumns("dia_jobsourcevesselid", "dia_vessel", "dia_quantity");
                        querySourceVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);

                        EntityCollection resultsSourceVessel = service.RetrieveMultiple(querySourceVessel);

                        foreach (var sourceVessel in resultsSourceVessel.Entities)
                        {
                            if (sourceVessel.GetAttributeValue<EntityReference>("dia_vessel") != null)
                            {
                                var vesselInformation = service.Retrieve(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition", "dia_location", "dia_stage"));

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

                                #region Create Source Vessel Transaction

                                var createTransaction = new Entity("dia_vesselstocktransactions");
                                createTransaction.Attributes["dia_location"] = vesselInformation.Contains("dia_location") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_location") : null;
                                createTransaction.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                                createTransaction.Attributes["dia_vessel"] = sourceVessel.GetAttributeValue<EntityReference>("dia_vessel");
                                createTransaction.Attributes["dia_stage"] = vesselInformation.Contains("dia_stage") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_stage") : null;
                                createTransaction.Attributes["dia_quantity"] = sourceVessel.GetAttributeValue<decimal>("dia_quantity") * -1;
                                createTransaction.Attributes["dia_referencetype"] = new OptionSetValue(914440000); //job

                                service.Create(createTransaction);

                                #endregion
                            }
                            var jobSourceVesselUpdate = new Entity(sourceVessel.LogicalName);
                            jobSourceVesselUpdate.Id = sourceVessel.Id;
                            jobSourceVesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);//Completed
                            service.Update(jobSourceVesselUpdate);
                        }

                        #endregion

                        #region Update Destination Vessel Quantity and Composition

                        var JobLogic = new JobEntity();
                        EntityCollection resultsQueryJobDestinationVessel = JobLogic.GetDestinationQuantity(service, targetEntity);



                        foreach (var jobdestinationvessel in resultsQueryJobDestinationVessel.Entities)
                        {
                            var vesselInformation = service.Retrieve(jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition", "dia_location", "dia_stage"));

                            var destinationVesselUpdate = new Entity(vesselInformation.LogicalName);
                            destinationVesselUpdate.Id = vesselInformation.Id;
                            destinationVesselUpdate.Attributes["dia_occupation"] = jobdestinationvessel.GetAttributeValue<decimal>("dia_quantity") + vesselInformation.GetAttributeValue<decimal>("dia_occupation");
                            destinationVesselUpdate.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                            destinationVesselUpdate.Attributes["dia_composition"] = batchComposition != null ? batchComposition.GetAttributeValue<EntityReference>("dia_batchcomposition") : null;

                            service.Update(destinationVesselUpdate);

                            #region Create Destination Vessel Transaction

                            var createTransaction = new Entity("dia_vesselstocktransactions");
                            createTransaction.Attributes["dia_location"] = vesselInformation.Contains("dia_location") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_location") : null;
                            createTransaction.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                            createTransaction.Attributes["dia_vessel"] = jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel");
                            createTransaction.Attributes["dia_stage"] = vesselInformation.Contains("dia_stage") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_stage") : null;
                            createTransaction.Attributes["dia_quantity"] = jobdestinationvessel.GetAttributeValue<decimal>("dia_quantity");
                            createTransaction.Attributes["dia_referencetype"] = new OptionSetValue(914440000);//job

                            service.Create(createTransaction);
                            #endregion
                            
                            #region jobdestinationvessel status code
                            var vesselUpdate = new Entity(jobdestinationvessel.LogicalName);
                            vesselUpdate.Id = jobdestinationvessel.Id;
                            vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);//Completed
                            service.Update(vesselUpdate);
                            #endregion
                        }
                        #endregion
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

                                #region Create Source Vessel Transaction

                                var createTransaction = new Entity("dia_vesselstocktransactions");
                                createTransaction.Attributes["dia_location"] = vesselInformation.Contains("dia_location") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_location") : null;
                                createTransaction.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                                createTransaction.Attributes["dia_vessel"] = sourceVessel.GetAttributeValue<EntityReference>("dia_vessel");
                                createTransaction.Attributes["dia_stage"] = vesselInformation.Contains("dia_stage") == true ? vesselInformation.GetAttributeValue<EntityReference>("dia_stage") : null;
                                createTransaction.Attributes["dia_quantity"] = sourceVessel.GetAttributeValue<decimal>("dia_quantity") * -1;
                                createTransaction.Attributes["dia_reference"] = "Dispatch";
                                createTransaction.Attributes["dia_referencetype"] = new OptionSetValue(914440000);//job

                                service.Create(createTransaction);

                                #endregion

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
                        }

                        #endregion
                    }
                }

            }
        }

        
    }
}
