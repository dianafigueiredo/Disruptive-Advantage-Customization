﻿using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WineryManagement
{
    public class JobDestinationVesselPreCreate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity jobDestination = (Entity)context.InputParameters["Target"];
                var destVessel = (EntityReference)jobDestination["dia_vessel"];
                var qtdDestination = (decimal)jobDestination["dia_quantity"];

                var jobRef = (EntityReference)jobDestination["dia_job"];
                var jobEnt = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));

                #region JobsToFill
                var queryJobDestinations = new QueryExpression("dia_jobdestinationvessel");
                queryJobDestinations.ColumnSet = new ColumnSet("dia_vessel", "dia_quantity");
                queryJobDestinations.Criteria = new FilterExpression(LogicalOperator.And);
                queryJobDestinations.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, destVessel.Id);

                var jobLinkEntityDest = new LinkEntity("dia_jobdestinationvessel", "dia_job", "dia_job", "dia_jobid", JoinOperator.Inner);
                jobLinkEntityDest.Columns = new ColumnSet(false);
                jobLinkEntityDest.LinkCriteria = new FilterExpression(LogicalOperator.And);
                jobLinkEntityDest.LinkCriteria.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, (DateTime)jobEnt["dia_schelduledstart"]);
                jobLinkEntityDest.LinkCriteria.AddCondition("statuscode", ConditionOperator.Equal, 914440001);
                queryJobDestinations.LinkEntities.Add(jobLinkEntityDest);
                var vesselFills = service.RetrieveMultiple(queryJobDestinations);

                var qtdFill = 0m;
                foreach (var vessFill in vesselFills.Entities)
                {
                    qtdFill += (decimal)vessFill["dia_quantity"];
                }
                #endregion JobsToFill

                #region JobsToEmpty
                var queryJobSource = new QueryExpression("dia_jobsourcevessel");
                queryJobSource.ColumnSet = new ColumnSet("dia_quantity");
                queryJobSource.Criteria = new FilterExpression(LogicalOperator.And);
                queryJobSource.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, destVessel.Id);

                var jobLinkEntitySource = new LinkEntity("dia_jobdestinationvessel", "dia_job", "dia_job", "dia_jobid", JoinOperator.Inner);
                jobLinkEntitySource.Columns = new ColumnSet(false);
                jobLinkEntitySource.LinkCriteria = new FilterExpression(LogicalOperator.And);
                jobLinkEntitySource.LinkCriteria.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, (DateTime)jobEnt["dia_schelduledstart"]);
                jobLinkEntitySource.LinkCriteria.AddCondition("statuscode", ConditionOperator.Equal, 914440001);
                queryJobSource.LinkEntities.Add(jobLinkEntitySource);
                var vesselEmpty = service.RetrieveMultiple(queryJobSource);

                var qtdDrop = 0m;
                foreach (var vessEmpty in vesselEmpty.Entities)
                {
                    qtdDrop += (decimal)vessEmpty["dia_quantity"];
                }
                #endregion JobsToEmpty

                var vesselEnt = service.Retrieve("dia_vessel", destVessel.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name"));
                var occVessel = vesselEnt.GetAttributeValue<decimal>("dia_occupation");
                var capVessel = vesselEnt.GetAttributeValue<decimal>("dia_capacity");
                var qtdJobDestVessel = (decimal)jobDestination["dia_quantity"];


                var finalOccupation = capVessel - occVessel - qtdJobDestVessel - qtdFill + qtdDrop;


                //throw new InvalidPluginExecutionException(" Final Occupation " + finalOccupation + " capJobDestVessel: " + capVessel + " occupation: " + occVessel + " qtdJobDestVessel " + qtdJobDestVessel + " qtdFill: " + qtdFill + " qtdDrop: " + qtdDrop);

                if (finalOccupation < 0)
                    throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] + " will not have that capacity, will exceeed in " + finalOccupation);

                #region different actions
                var VesselEntity = (EntityReference)jobDestination["dia_vessel"];
                var vesselInfo = service.Retrieve("dia_vessel", VesselEntity.Id, new ColumnSet("dia_occupation", "dia_capacity", "dia_name", "dia_remainingcapacity"));
                var vesselOccupation = vesselInfo.GetAttributeValue<decimal>("dia_occupation");
                var vesselCapacity = vesselInfo.GetAttributeValue<decimal>("dia_capacity");
                tracingService.Trace("ocupação: " + vesselOccupation);
                var JobEntity = (EntityReference)jobDestination["dia_job"];
                var JobInfo = service.Retrieve(jobRef.LogicalName, JobEntity.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));
                var jobtype = JobInfo.GetAttributeValue<OptionSetValue>("dia_type") != null ? JobInfo.GetAttributeValue<OptionSetValue>("dia_type") : null;

                tracingService.Trace("job type: " + jobtype.Value);

                if (jobtype != null && jobtype.Value == 914440002) // if job type intake
                {
                    if(jobDestination.GetAttributeValue<decimal>("dia_quantity") > vesselCapacity)
                    {
                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " does not have enough capacity. Max. Capacity: " + Decimal.ToInt32(vesselCapacity) + "L");
                    }
                    if (vesselOccupation != 0) {

                        throw new InvalidPluginExecutionException("Sorry but the vessel " + vesselEnt["dia_name"] + " at this date " + jobEnt["dia_schelduledstart"] +"is full");


                    }
                }

                if (jobtype != null && jobtype.Value == 914440000 || jobtype.Value == 914440003) { //if job type in-situ or dispatch +


                    if(vesselOccupation == 0) {

                        throw new InvalidPluginExecutionException("The vessel" + vesselEnt["dia_name"] + " is empty");

                    }
                
                }


                #endregion

            }

        }




    }
}