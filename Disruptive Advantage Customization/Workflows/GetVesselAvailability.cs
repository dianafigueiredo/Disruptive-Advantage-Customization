using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Activities;
using Microsoft.Xrm.Sdk.Workflow;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Disruptive_Advantage_Customization.Entities;
using Disruptive_Advantage_Customization.BusinessLogicHelper;

namespace Disruptive_Advantage_Customization.Workflows
{
	public class GetVesselAvailability : CodeActivity
	{
        [Input("job")]
        public InArgument<string> Job { get; set; }
        [Output("result")]
        public OutArgument<string> Result { get; set; }
        protected override void Execute(CodeActivityContext executionContext)
		{
			ITracingService tracingService = executionContext.GetExtension<ITracingService>();
			try
			{
				IWorkflowContext context = executionContext.GetExtension<IWorkflowContext>();
				IOrganizationServiceFactory serviceFactory = executionContext.GetExtension<IOrganizationServiceFactory>();
				IOrganizationService service = serviceFactory.CreateOrganizationService(context.InitiatingUserId);

                string usersResults = "";
                List<Users> usersResult = new List<Users>();
                var query = new QueryExpression("dia_vessel");
                query.ColumnSet.AddColumns("dia_vesselid", "dia_name", "dia_capacity", "dia_type", "dia_occupation");

                EntityCollection resultsVessel = service.RetrieveMultiple(query);
                var i = 0;
                foreach (var vessel in resultsVessel.Entities)
                {
                    Users users = new Users();
                    tracingService.Trace("i: " + i);
                    var destVessel = new EntityReference(vessel.LogicalName, vessel.Id);
                    var resultAux = "";


                    var jobRef = new EntityReference("dia_job", new Guid(this.Job.Get(executionContext)));
                    var jobEnt = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));


                    #region JobsToFill
                    var JobDestinationLogic = new JobDestinationEntity();

                    var JobSourceLogic = new JobSourceEntity();
                    //var vesselFills = JobDestinationLogic.GetDestinationVesselQuantity(service, jobDestination, destVessel, jobEnt);
                    var vesselAsDestination = JobSourceLogic.GetVesselJobAsDestination(service, destVessel, jobEnt);

                    var logiHelper = new LogicHelper();
                    var qtdFill = logiHelper.SumOfQuantities(vesselAsDestination, "dia_quantity", tracingService);

                    tracingService.Trace("3");
                    #endregion JobsToFill

                    #region JobsToEmpty

                    var vessEmpty = JobDestinationLogic.GetSourceVesselQuantity(service, destVessel, jobEnt);
                    var qtdDrop = logiHelper.SumOfQuantities(vessEmpty, "dia_quantity", tracingService);
                    tracingService.Trace("4");

                    #endregion JobsToEmpty

                    var vesselEnt = service.Retrieve("dia_vessel", destVessel.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name", "dia_remainingcapacity"));
                    var occVessel = vesselEnt.GetAttributeValue<decimal>("dia_occupation");
                    var capVessel = vesselEnt.GetAttributeValue<decimal>("dia_capacity");
                    //var qtdJobDestVessel = jobDestination.GetAttributeValue<decimal>("dia_quantity");
                    var qtdJobDestVessel = 0; // 0 because quantity is not populated at this moment

                    tracingService.Trace("5");

                    var finalOccupation = logiHelper.FinalOccupation(capVessel, occVessel, qtdJobDestVessel, qtdFill, qtdDrop);

                    #region traces
                    tracingService.Trace("Vessel name: " + vessel.GetAttributeValue<string>("dia_name"));
                    tracingService.Trace("capVessel: " + capVessel);
                    tracingService.Trace("occVessel: " + occVessel);
                    tracingService.Trace("qtdJobDestVessel: " + qtdJobDestVessel);
                    tracingService.Trace("qtdFill: " + qtdFill);
                    tracingService.Trace("qtdDrop: " + qtdDrop);
                    tracingService.Trace("finalOccupation: " + finalOccupation);
                    #endregion
                    if (finalOccupation < 0 && jobEnt.GetAttributeValue<OptionSetValue>("dia_type").Value != 914440000)
                    {
                        //this.Result.Set(executionContext, "Unavailable");
                        resultAux = "Unavailable";
                    }

                    #region different actions

                    var plannedvesselOccupation = logiHelper.VesselOccupation(vesselAsDestination);

                    tracingService.Trace("vessel Occupation: " + plannedvesselOccupation);

                    var vesselOccupation = vesselEnt.GetAttributeValue<decimal>("dia_occupation");
                    var vesselCapacity = vesselEnt.GetAttributeValue<decimal>("dia_capacity");

                    var JobEntity = new EntityReference("dia_job", new Guid(this.Job.Get(executionContext)));
                    var JobInfo = service.Retrieve(jobRef.LogicalName, JobEntity.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));
                    var jobtype = JobInfo.GetAttributeValue<OptionSetValue>("dia_type") != null ? JobInfo.GetAttributeValue<OptionSetValue>("dia_type") : null;

                    if (jobtype != null && (jobtype.Value == 914440002 || jobtype.Value == 914440001)) // if job type intake or transfer
                    {

                        if (plannedvesselOccupation != 0 && jobtype.Value != 914440001)
                        {
                            //this.Result.Set(executionContext, "Unavailable");
                            resultAux = "Unavailable";
                        }
                        if (vesselOccupation > 0 && jobtype.Value != 914440001)
                        {
                            //this.Result.Set(executionContext, "Unavailable");
                            resultAux = "Unavailable";
                        }
                    }

                    if (jobtype != null && jobtype.Value == 914440000 || jobtype.Value == 914440003) //In-Situ && Dispatch
                    { //if job type in-situ or dispatch +
                        if (plannedvesselOccupation <= 0 && vesselOccupation <= 0)
                        {
                            //this.Result.Set(executionContext, "Unavailable");
                            resultAux = "Unavailable";
                        }
                    }
                    if (!resultAux.Contains("Unavailable")) resultAux = "Available";
                    #endregion

                    users.label = vessel.GetAttributeValue<string>("dia_name") + " (" + Convert.ToInt32(vessel.GetAttributeValue<decimal>("dia_capacity")) + ") " + resultAux;
                    users.value = vessel.GetAttributeValue<string>("dia_name") + " _ " + vessel.GetAttributeValue<Guid>("dia_vesselid") + " _ " + "dia_vessel$$$" + vessel.FormattedValues["dia_type"];
                    users.type = vessel.FormattedValues["dia_type"];
                    users.available = resultAux;
                    //tracingService.Trace("users: " + usersResults);
                    usersResult.Add(users);
                    i++;
                }
                this.Result.Set(executionContext, JsonHelper.JsonSerializer<List<Users>>(usersResult));
                tracingService.Trace("Final: " + JsonHelper.JsonSerializer<List<Users>>(usersResult));
            }
            catch (Exception ex)
			{
				throw new InvalidPluginExecutionException("Error: " + ex.Message);
			}
		}
	}
}
public class Users
{
    public string label { get; set; }
    public string value { get; set; }
    public string type { get; set; }
    public string available { get; set; }
}