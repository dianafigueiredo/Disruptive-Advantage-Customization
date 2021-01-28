using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Disruptive_Advantage_Customization
{
    public class PostCreate_sync : IPlugin
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


                    var vesselInfo = targetEntity.GetAttributeValue<EntityReference>("dia_vessel");

                    var quantity = targetEntity.GetAttributeValue<decimal?>("dia_quantity") == null ? 0 : targetEntity.GetAttributeValue<decimal>("dia_quantity");

                    var type = targetEntity.GetAttributeValue<OptionSetValue>("dia_type");

                    var batch = targetEntity.GetAttributeValue<EntityReference>("dia_batch");

                    var occupation = targetEntity.GetAttributeValue<decimal>("dia_batch");

                    #region Update Vessel. Job type Intake
                    if (type.Value == 914440002 && vesselInfo != null)
                    {

                        var vesselCapacity = service.Retrieve(vesselInfo.LogicalName, vesselInfo.Id, new ColumnSet("dia_capacity"));

                        if (vesselCapacity != null && vesselCapacity.Contains("dia_capacity"))
                        {
                            var remainingCapacity = vesselCapacity.GetAttributeValue<decimal>("dia_capacity") - quantity;
                            var vesselUpdate = new Entity(vesselInfo.LogicalName);
                            vesselUpdate.Id = vesselInfo.Id;
                            vesselUpdate.Attributes["dia_occupation"] = quantity;
                            vesselUpdate.Attributes["dia_remainingcapacity"] = remainingCapacity;

                            service.Update(vesselUpdate);
                        }
                    }
                    #endregion


                    #region create transaction 
                    {

                        var createTransaction = new Entity("dia_vesselstocktransactions");

                        createTransaction.Attributes["dia_quantity"] = quantity;
                 
                        createTransaction.Attributes["dia_batch"] = batch;

                        service.Create(createTransaction);
                    }
                    #endregion


                    #region Assign composition from batch to vessel
                    
                    var batchComposition = batch != null ? service.Retrieve(batch.LogicalName, batch.Id, new ColumnSet("dia_batchcomposition")) : null; 
                    if (type.Value == 914440002 && batchComposition != null)
                    {
                        if(vesselInfo != null)
                        {
                            var name= targetEntity.GetAttributeValue<string>("dia_name");
                            var occupation = targetEntity.GetAttributeValue<decimal>("dia_occupation");
                            var location = targetEntity.GetAttributeValue<EntityReference>("dia_location");
                            var batchVessel = targetEntity.GetAttributeValue<EntityReference>("dia_batch");
                            var compositionVessel = targetEntity.GetAttributeValue<EntityReference>("dia_batchcomposition");
                            var capacityVessel = targetEntity.GetAttributeValue<EntityReference>("dia_capacity");

                            var createVessel = new Entity("dia_vessel");

                            createVessel.Attributes["dia_name"] = name;
                            createVessel.Attributes["dia_occupation"] = occupation;
                            createVessel.Attributes["dia_location"] = location;
                            createVessel.Attributes["dia_batch"] = batchVessel;
                            createVessel.Attributes["dia_batchcomposition"] = compositionVessel;
                            createVessel.Attributes["dia_capacity"] = capacityVessel;

                            service.Create(createVessel);

                        }
                    }
                    #endregion


                    #region Completed Action 
                    Entity jobDestination = (Entity)context.InputParameters["Target"];
                    var jobRef = (EntityReference)jobDestination["dia_job"];

                   
                    var Vessel = service.Retrieve("dia_vessel", vesselInfo.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name", "dia_remainingcapacity"));
                

                    var JobEntity = (EntityReference)jobDestination["dia_job"];
                    var JobInfo = service.Retrieve(jobRef.LogicalName, JobEntity.Id, new ColumnSet("statuscode", "dia_quantity", "dia_type"));
                    var jobtype = JobInfo.GetAttributeValue<OptionSetValue>("dia_type") != null ? JobInfo.GetAttributeValue<OptionSetValue>("dia_type") : null;
                    var jobstatuscode = JobInfo.GetAttributeValue<OptionSetValue>("statuscode") != null ? JobInfo.GetAttributeValue<OptionSetValue>("statuscode") : null;
                    var jobquantity = JobInfo.GetAttributeValue<OptionSetValue>("dia_quantity") != null ? JobInfo.GetAttributeValue<OptionSetValue>("dia_quantity") : null;

                    var BatchEntity = targetEntity.GetAttributeValue<EntityReference>("dia_batch");
                    var BatchInfo = service.Retrieve(BatchEntity.LogicalName, BatchEntity.Id, new ColumnSet("dia_batchcomposition", "dia_quantity", "dia_type"));
                   
                   



                    if (jobtype != null && jobtype.Value == 914440002 && jobstatuscode.Value == 914440000) {

                        var VesselUpdate = new Entity(vesselInfo.LogicalName);
                        VesselUpdate.Id = vesselInfo.Id;
                        VesselUpdate.Attributes["dia_occupation"] = occupation;
                        VesselUpdate.Attributes["dia_batch"] = occupation;
                        VesselUpdate.Attributes["dia_batchcomposition"] = BatchInfo.GetAttributeValue<EntityReference>("dia_batchcomposition");

                        service.Update(VesselUpdate);



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
