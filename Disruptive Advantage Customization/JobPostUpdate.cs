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

                        var vesselInfo = targetEntity.GetAttributeValue<EntityReference>("dia_vessel");

                        var quantity = targetEntity.GetAttributeValue<decimal?>("dia_quantity") == null ? 0 : targetEntity.GetAttributeValue<decimal>("dia_quantity");

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
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }

        }
    }
}
