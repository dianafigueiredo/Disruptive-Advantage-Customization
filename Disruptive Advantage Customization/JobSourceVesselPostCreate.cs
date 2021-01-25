using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization
{
    class JobSourceVesselPostCreate : IPlugin
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

                    var jobRef = (EntityReference)job["dia_job"];
                    var  jobType= service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_type"));



                }

            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }

}

