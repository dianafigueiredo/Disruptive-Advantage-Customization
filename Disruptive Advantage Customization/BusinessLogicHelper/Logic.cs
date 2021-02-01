using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Disruptive_Advantage_Customization.Entities;
using Microsoft.Xrm.Sdk.Query;

namespace Disruptive_Advantage_Customization.BusinessLogicHelper
{
    public class Logic
    {
        public void JobDestinationVesselPreCreateLogic(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {
            if (context != null && context.InputParameters != null && context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity jobDestination = (Entity)context.InputParameters["Target"];
                var destVessel = (EntityReference)jobDestination["dia_vessel"];
                var qtdDestination = (decimal)jobDestination["dia_quantity"];
                var jobRef = (EntityReference)jobDestination["dia_job"];
                var jobEnt = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));

                #region JobsToFill

                var JobDestinationLogic = new JobDestinationEntity();
                var vesselFills = JobDestinationLogic.GetDestinationVesselQuantity(service, jobDestination, destVessel, jobEnt);

                var logiHelper = new LogicHelper();
                var qtdFill = logiHelper.SumOfQuantities(vesselFills, "dia_quantity");

                #endregion JobsToFill

                #region JobsToEmpty

                var vessEmpty = JobDestinationLogic.GetSourceVesselQuantity(service, jobDestination, destVessel, jobEnt);
                var qtdDrop = logiHelper.SumOfQuantities(vessEmpty, "dia_quantity");

                #endregion JobsToEmpty

                var vesselEnt = service.Retrieve("dia_vessel", destVessel.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name"));
                var occVessel = vesselEnt.GetAttributeValue<decimal>("dia_occupation");
                var capVessel = vesselEnt.GetAttributeValue<decimal>("dia_capacity");
                var qtdJobDestVessel = (decimal)jobDestination["dia_quantity"];


                var finalOccupation = capVessel - occVessel - qtdJobDestVessel - qtdFill + qtdDrop;

                if (finalOccupation < 0)
                    throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + " will not have that capacity, will exceeed in " + finalOccupation);

                #region different actions

                var VesselEntity = (EntityReference)jobDestination["dia_vessel"];
                var vesselInfo = service.Retrieve("dia_vessel", VesselEntity.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name", "dia_remainingcapacity"));
                var vesselOccupation = vesselInfo.GetAttributeValue<decimal>("dia_occupation");
                var vesselCapacity = vesselInfo.GetAttributeValue<decimal>("dia_capacity");

                var JobEntity = (EntityReference)jobDestination["dia_job"];
                var JobInfo = service.Retrieve(jobRef.LogicalName, JobEntity.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));
                var jobtype = JobInfo.GetAttributeValue<OptionSetValue>("dia_type") != null ? JobInfo.GetAttributeValue<OptionSetValue>("dia_type") : null;

                if (jobtype != null && jobtype.Value == 914440002) // if job type intake
                {
                    if (jobDestination.GetAttributeValue<decimal>("dia_quantity") > vesselCapacity)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " does not have enough capacity. Max. Capacity: " + Decimal.ToInt32(vesselCapacity) + "L");
                    }
                    if (vesselOccupation != 0)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + "is full");
                    }
                }

                if (jobtype != null && jobtype.Value == 914440000 || jobtype.Value == 914440003)
                { //if job type in-situ or dispatch +

                    if (vesselOccupation == 0)
                    {
                        throw new InvalidPluginExecutionException("The vessel" + vesselEnt["dia_name"] + " is empty");
                    }
                }
                #endregion
            }
        }
        public void JobSourceVesselPostCreate(IOrganizationService service, IPluginExecutionContext context, ITracingService tracingService)
        {
            if (context != null && context.InputParameters != null && context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
                {
                    Entity job = (Entity)context.InputParameters["Target"];

                    var jobRef = (EntityReference)job["dia_job"];
                    var jobType = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_type", "dia_quantity"));
                    decimal? sumQuantity = new decimal();

                    if (jobType.FormattedValues["dia_type"] == "Dispatch")
                    {
                        var JobSourceLogic = new JobSourceEntity();
                        var resultsquery = JobSourceLogic.GetJobSourceVessel(service, jobRef);

                        var logiHelper = new LogicHelper();
                        sumQuantity = logiHelper.SumOfQuantities(resultsquery, "dia_quantity");

                        var jobUpdate = new Entity(jobRef.LogicalName, jobRef.Id);
                        jobUpdate.Attributes["dia_quantity"] = sumQuantity;
                        service.Update(jobUpdate);
                    }

                }
            }
        }
    }
}
