using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Disruptive_Advantage_Customization
{
    public class JobPreCreate : IPlugin
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
                    tracingService.Trace("1");
                    var status = targetEntity.GetAttributeValue<OptionSetValue>("statuscode");
                    tracingService.Trace("2");
                    var batch = targetEntity.GetAttributeValue<EntityReference>("dia_batch");
                    tracingService.Trace("3");
                    var batchstatus = batch == null ? null : service.Retrieve(batch.LogicalName, batch.Id, new ColumnSet("statuscode"));
                    tracingService.Trace("4");
                    if (batchstatus != null && batchstatus.GetAttributeValue<OptionSetValue>("statuscode").Value == 914440000)
                    {

                        throw new InvalidPluginExecutionException("Can't create a job because the batch isn't finished yet");

                    }

                    #region vessel empty or full  
                    tracingService.Trace("5");
                    var type = targetEntity.GetAttributeValue<OptionSetValue>("dia_type");
                    /*var occupation = targetEntity.GetAttributeValue<decimal>("dia_occupation");
                    var capacity = targetEntity.GetAttributeValue<decimal>("dia_capacity");*/
                    var vessel = targetEntity.GetAttributeValue<EntityReference>("dia_vessel");
                    tracingService.Trace("6");

                    /*
                          var vesselInfo = vessel != null ? service.Retrieve(vessel.LogicalName, vessel.Id, new ColumnSet("dia_occupation")) : null;

                          var occupation = Decimal.ToInt32(vesselInfo.GetAttributeValue<decimal>("dia_occupation"));
                          if (type.Value == 914440002 && occupation != 0)
                          {

                              throw new InvalidPluginExecutionException("Can't create a job because the destination vessel isn't empty ");

                          }*/
                    #endregion


                    #region Date Verification (Schedule Start and Schedule End)

                    if (vessel != null)
                    {
                     
                        var scheduleStart = targetEntity.GetAttributeValue<DateTime>("dia_schelduledstart");
                        var scheduleEnd = targetEntity.GetAttributeValue<DateTime>("dia_schelduledfinish");
                        var queryJob = new QueryExpression("dia_job");
                        queryJob.ColumnSet.AddColumns("dia_schelduledstart", "dia_schelduledfinish");
                        queryJob.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, vessel.Id);

                        EntityCollection resultsqueryJob = service.RetrieveMultiple(queryJob);
                    
                        foreach (var job in resultsqueryJob.Entities)
                        {
                            
                            if (scheduleStart > job.GetAttributeValue<DateTime>("dia_schelduledstart") && scheduleStart < job.GetAttributeValue<DateTime>("dia_schelduledfinish"))
                            {
                                throw new InvalidPluginExecutionException("Can't create a job because the vessel is not empty in that schedule");
                            }
                            if (scheduleEnd > job.GetAttributeValue<DateTime>("dia_schelduledstart") && scheduleEnd < job.GetAttributeValue<DateTime>("dia_schelduledfinish"))
                            {
                                throw new InvalidPluginExecutionException("Can't create a job because the vessel is not empty in that schedule");
                            }
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
