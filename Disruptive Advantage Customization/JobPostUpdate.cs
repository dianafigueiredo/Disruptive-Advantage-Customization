using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Disruptive_Advantage_Customization
{
    public class JobPostUpdate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            try
            {
                IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

                if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
                {
                    Entity targetEntity = (Entity)context.InputParameters["Target"];

                    #region update  job status reason = completed
                    if (targetEntity.Contains("statuscode") && targetEntity.GetAttributeValue<OptionSetValue>("statuscode").Value == 914440000)
                    {
                        var statuscode = targetEntity.GetAttributeValue<OptionSetValue>("statuscode");
                        var quantity = targetEntity.GetAttributeValue<decimal?>("dia_quantity") == null ? 0 : targetEntity.GetAttributeValue<decimal>("dia_quantity");
                        /*if (vesselCapacity != null && vesselCapacity.Contains("dia_capacity"))
                        {
                            var remainingCapacity = vesselCapacity.GetAttributeValue<decimal>("dia_capacity") - quantity;
                            var vesselUpdate = new Entity(vesselInfo.LogicalName);
                            vesselUpdate.Id = vesselInfo.Id;
                            vesselUpdate.Attributes["dia_occupation"] = quantity;
                            vesselUpdate.Attributes["dia_remainingcapacity"] = remainingCapacity;
                            service.Update(vesselUpdate);
                        }*/
                        #region Update Source Vessel Quantity and Composition

                        var querySourceVessel = new QueryExpression("dia_jobsourcevessel");
                        querySourceVessel.ColumnSet.AddColumns("dia_jobsourcevesselid", "dia_vessel", "dia_quantity");
                        querySourceVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);

                        EntityCollection resultsSourceVessel = service.RetrieveMultiple(querySourceVessel);

                        foreach (var sourceVessel in resultsSourceVessel.Entities)
                        {
                            if(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel") != null)
                            {
                                var vesselInformation = service.Retrieve(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition"));
                                
                                var sourceVesselUpdate = new Entity(vesselInformation.LogicalName);
                                sourceVesselUpdate.Attributes["dia_occupation"] = vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity");
                                
                                if(vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity") == 0)
                                {
                                    sourceVesselUpdate.Attributes["dia_batch"] = null;
                                    sourceVesselUpdate.Attributes["dia_composition"] = null;
                                }
                                service.Update(sourceVesselUpdate);
                            }
                        }
                        #endregion
                        #region Update Destination Vessel Quantity and Composition
                        var queryJobDestinationVessel = new QueryExpression("dia_jobdestinationvessel");
                        queryJobDestinationVessel.ColumnSet.AddColumns("dia_jobdestinationvesselid");
                        queryJobDestinationVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);
                        EntityCollection resultsQueryJobDestinationVessel = service.RetrieveMultiple(queryJobDestinationVessel);
                        foreach (var vessel in resultsQueryJobDestinationVessel.Entities)
                        {
                            var vesselUpdate = new Entity(vessel.LogicalName);
                            vesselUpdate.Id = vessel.Id;
                            vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);
                            service.Update(vesselUpdate);
                        }
                        #endregion
                    }
                    if(targetEntity.Contains("statuscode") && targetEntity.GetAttributeValue<OptionSetValue>("statuscode").Value == 914440000)
                    {
                        var jobType = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_jobtype"));
                        if(jobType.Contains("dia_jobtype") && jobType.GetAttributeValue<OptionSetValue>("dia_jobtype") != null && jobType.GetAttributeValue<OptionSetValue>("dia_jobtype").Value == 914440001)
                        {
                            #region Update Source Vessel Quantity and Composition
                            var querySourceVessel = new QueryExpression("dia_jobsourcevessel");
                            querySourceVessel.ColumnSet.AddColumns("dia_jobsourcevesselid", "dia_vessel", "dia_quantity");
                            querySourceVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);

                            EntityCollection resultsSourceVessel = service.RetrieveMultiple(querySourceVessel);

                            foreach (var sourceVessel in resultsSourceVessel.Entities)
                            {
                                if (sourceVessel.GetAttributeValue<EntityReference>("dia_vessel") != null)
                                {
                                    var vesselInformation = service.Retrieve(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition"));

                                    var sourceVesselUpdate = new Entity(vesselInformation.LogicalName);
                                    sourceVesselUpdate.Attributes["dia_occupation"] = vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity");

                                    if (vesselInformation.GetAttributeValue<decimal>("dia_occupation") - sourceVessel.GetAttributeValue<decimal>("dia_quantity") == 0)
                                    {
                                        sourceVesselUpdate.Attributes["dia_batch"] = null;
                                        sourceVesselUpdate.Attributes["dia_composition"] = null;
                                    }
                                    service.Update(sourceVesselUpdate);
                                }
                            }
                            #endregion
                            #region Update Destination Vessel Quantity and Composition
                            var queryJobDestinationVessel = new QueryExpression("dia_jobdestinationvessel");
                            queryJobDestinationVessel.ColumnSet.AddColumns("dia_jobdestinationvesselid");
                            queryJobDestinationVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);
                            EntityCollection resultsQueryJobDestinationVessel = service.RetrieveMultiple(queryJobDestinationVessel);
                            foreach (var vessel in resultsQueryJobDestinationVessel.Entities)
                            {
                                var vesselUpdate = new Entity(vessel.LogicalName);
                                vesselUpdate.Id = vessel.Id;
                                vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);
                                service.Update(vesselUpdate);
                            }
                            #endregion
                        }
                    }
                    #endregion
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }

        }
    }
}
