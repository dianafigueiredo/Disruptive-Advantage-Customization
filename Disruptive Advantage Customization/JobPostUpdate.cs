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
                        var jobType = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_type"));
                        if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440002)//intake
                        {
                            var statuscode = targetEntity.GetAttributeValue<OptionSetValue>("statuscode");
                            var quantity = targetEntity.GetAttributeValue<decimal?>("dia_quantity") == null ? 0 : targetEntity.GetAttributeValue<decimal>("dia_quantity");
                            var jobInformation = service.Retrieve(targetEntity.LogicalName, targetEntity.Id, new ColumnSet("dia_batch"));
                            var batchComposition = jobInformation != null ? service.Retrieve(jobInformation.GetAttributeValue<EntityReference>("dia_batch").LogicalName, jobInformation.GetAttributeValue<EntityReference>("dia_batch").Id, new ColumnSet("dia_batchcomposition")) : null;
                            //Quando o job é completed vamos buscar todos os job destination vessel. Nesse vessel depois são atualizados os campos occupation, batch e composition. 
                            
                            #region Update Destination Vessel Quantity and Composition
                            var queryJobDestinationVessel = new QueryExpression("dia_jobdestinationvessel");
                            queryJobDestinationVessel.ColumnSet.AddColumns("dia_jobdestinationvesselid", "dia_vessel", "dia_quantity");
                            queryJobDestinationVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);

                            EntityCollection resultsQueryJobDestinationVessel = service.RetrieveMultiple(queryJobDestinationVessel);

                            foreach (var destinationVessel in resultsQueryJobDestinationVessel.Entities)
                            {
                                if (destinationVessel.GetAttributeValue<EntityReference>("dia_vessel") != null)
                                {
                                    var vesselInformation = service.Retrieve(destinationVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, destinationVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition"));

                                    var sourceVesselUpdate = new Entity(vesselInformation.LogicalName);
                                    sourceVesselUpdate.Id = vesselInformation.Id;
                                    sourceVesselUpdate.Attributes["dia_occupation"] = vesselInformation.GetAttributeValue<decimal>("dia_occupation") + destinationVessel.GetAttributeValue<decimal>("dia_quantity"); // ocupação do vessel + quantity do job destination vessel.
                                    sourceVesselUpdate.Attributes["dia_batch"] = jobInformation != null ? jobInformation.GetAttributeValue<EntityReference>("dia_batch") : null;
                                    sourceVesselUpdate.Attributes["dia_composition"] = batchComposition != null ? batchComposition.GetAttributeValue<EntityReference>("dia_batchcomposition") : null; //Composition que vem do batch

                                    service.Update(sourceVesselUpdate);
                                }
                                //update statuscode job destination vessel para completed
                                var vesselUpdate = new Entity(destinationVessel.LogicalName);
                                vesselUpdate.Id = destinationVessel.Id;
                                vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);
                                service.Update(vesselUpdate);
                            }
                            #endregion
                        }

                        if (jobType.Contains("dia_type") && jobType.GetAttributeValue<OptionSetValue>("dia_type") != null && jobType.GetAttributeValue<OptionSetValue>("dia_type").Value == 914440001)//transfer
                        {
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
                                    var vesselInformation = service.Retrieve(sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, sourceVessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition"));

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
                                }
                                var jobSourceVesselUpdate = new Entity(sourceVessel.LogicalName);
                                jobSourceVesselUpdate.Id = sourceVessel.Id;
                                jobSourceVesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);
                                service.Update(jobSourceVesselUpdate);
                            }
                            #endregion

                            #region Update Destination Vessel Quantity and Composition

                            var queryJobDestinationVessel = new QueryExpression("dia_jobdestinationvessel");
                            queryJobDestinationVessel.ColumnSet.AddColumns("dia_jobdestinationvesselid", "dia_quantity", "dia_vessel");
                            queryJobDestinationVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);

                            EntityCollection resultsQueryJobDestinationVessel = service.RetrieveMultiple(queryJobDestinationVessel);

                            foreach (var jobdestinationvessel in resultsQueryJobDestinationVessel.Entities)
                            {
                                var vesselInformation = service.Retrieve(jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel").LogicalName, jobdestinationvessel.GetAttributeValue<EntityReference>("dia_vessel").Id, new ColumnSet("dia_occupation", "dia_composition"));

                                var vesselUpdate = new Entity(jobdestinationvessel.LogicalName);
                                vesselUpdate.Id = jobdestinationvessel.Id;
                                vesselUpdate.Attributes["statuscode"] = new OptionSetValue(914440001);
                                service.Update(vesselUpdate);
                            }
                            #endregion
                        }
                        #endregion
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }

        }
    }
}
