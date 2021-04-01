using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Disruptive_Advantage_Customization.BusinessLogicHelper;
using Microsoft.Xrm.Sdk;

namespace Disruptive_Advantage_Customization
{
    public class JobDestinationVesselPostCreate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            try
            {
                var logic = new Logic();
                logic.JobDestinationVesselPostCreate(service, context, tracingService);
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(String.Format("Error on Plugin JobSourceVesselPostCreate with message: ", ex.Message));
            }
        }
    }
}
