using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Disruptive_Advantage_Customization
{
    public class JobSourceVesselPostCreate : IPlugin
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

                    Entity job = (Entity)context.InputParameters["Target"];
                    tracingService.Trace("1");

                    var jobRef = (EntityReference)job["dia_job"];
                    var jobType = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_type", "dia_quantity"));
                    decimal sumQuantity = new decimal();
           
                    if (jobType.FormattedValues["dia_type"] == "Dispatch") {

                        var query = new QueryExpression("dia_jobsourcevessel");
                        query.ColumnSet.AddColumns("dia_quantity");
                        query.Criteria.AddCondition("dia_job", ConditionOperator.Equal, jobRef.Id);
                        
                        EntityCollection resultsquery = service.RetrieveMultiple(query);

                        tracingService.Trace("5");
                        foreach (var vessel in resultsquery.Entities)
                        {
                            sumQuantity += vessel.GetAttributeValue<decimal>("dia_quantity");
                        }

                        var jobUpdate = new Entity(jobRef.LogicalName, jobRef.Id);
                        jobUpdate.Attributes["dia_quantity"] = sumQuantity;   
                        service.Update(jobUpdate);
                       

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

