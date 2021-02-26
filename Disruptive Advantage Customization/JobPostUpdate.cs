using Disruptive_Advantage_Customization.BusinessLogicHelper;
using Microsoft.Xrm.Sdk;
using System;

namespace Disruptive_Advantage_Customization
{
    public class JobPostUpdate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            try
            {
                if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
                {
                    var logic = new Logic();
                    logic.JobPostUpdateCompleted(service, context, tracingService); //Update job status to Completed
                    tracingService.Trace("Finished Post Update");
                    logic.JobPostUpdateStarted(service, context, tracingService);//Update job status to In Progress
                    logic.JobPostUpdateTemplate(service, tracingService, context);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}