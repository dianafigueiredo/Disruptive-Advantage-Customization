﻿using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace Disruptive_Advantage_Customization.Entities
{
    public class JobDestinationEntity
    {
        /*public EntityCollection GetDestinationVesselQuantity(IOrganizationService service, Entity jobDestination, EntityReference destVessel, Entity jobEnt)
        {
            var queryJobDestinations = new QueryExpression("dia_jobdestinationvessel");
            queryJobDestinations.ColumnSet = new ColumnSet("dia_vessel", "dia_quantity");
            queryJobDestinations.Criteria = new FilterExpression(LogicalOperator.And);
            queryJobDestinations.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, destVessel.Id);

            var jobLinkEntityDest = new LinkEntity("dia_jobdestinationvessel", "dia_job", "dia_job", "dia_jobid", JoinOperator.Inner);
            jobLinkEntityDest.Columns = new ColumnSet(false);
            jobLinkEntityDest.LinkCriteria = new FilterExpression(LogicalOperator.And);
            jobLinkEntityDest.LinkCriteria.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, (DateTime)jobEnt["dia_schelduledstart"]);
            jobLinkEntityDest.LinkCriteria.AddCondition("statuscode", ConditionOperator.Equal, 914440001);//Completed
            queryJobDestinations.LinkEntities.Add(jobLinkEntityDest);

            var vesselFills = service.RetrieveMultiple(queryJobDestinations);

            return vesselFills;
        }*/
        public EntityCollection GetSourceVesselQuantity(IOrganizationService service, EntityReference destVessel, Entity jobEnt, Entity intakeEnt)
        {
            var queryJobSource = new QueryExpression("dia_jobsourcevessel");
            queryJobSource.ColumnSet = new ColumnSet("dia_quantity");
            queryJobSource.Criteria = new FilterExpression(LogicalOperator.And);
            queryJobSource.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, destVessel.Id);

            var jobLinkEntitySource = new LinkEntity("dia_jobdestinationvessel", "dia_job", "dia_job", "dia_jobid", JoinOperator.Inner);
            jobLinkEntitySource.Columns = new ColumnSet(false);

            if(jobEnt != null && jobEnt.GetAttributeValue<DateTime>("dia_schelduledstart") != DateTime.MinValue)
            {
                jobLinkEntitySource.LinkCriteria = new FilterExpression(LogicalOperator.And);
                jobLinkEntitySource.LinkCriteria.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, jobEnt.GetAttributeValue<DateTime>("dia_schelduledstart"));
                jobLinkEntitySource.LinkCriteria.AddCondition("statuscode", ConditionOperator.Equal, 914440001);//Completed
                queryJobSource.LinkEntities.Add(jobLinkEntitySource);
            }

            var vesselEmpty = service.RetrieveMultiple(queryJobSource);

            return vesselEmpty;
        }
        public EntityCollection GetDestinationQuantity(IOrganizationService service, EntityReference job)
        {
            var fetchXml = $@"
             <fetch aggregate='true'>
             <entity name='dia_jobdestinationvessel'>
             <attribute name='dia_quantity' alias='Quantity' aggregate='sum' />
             <filter>
             <condition attribute='dia_job' operator='eq' value='{job.Id}'/>
             </filter>
             </entity>
             </fetch>";

            var Quantity = service.RetrieveMultiple(new FetchExpression(fetchXml));

            return Quantity;



        }

        public EntityCollection GetCompositionVessel(IOrganizationService service, EntityReference jobdestination) {

            // Instantiate QueryExpression query
            var query = new QueryExpression("dia_jobdestinationvessel");
      

            // Add columns to query.ColumnSet
            query.ColumnSet.AddColumns("dia_vessel", "dia_vesseldropdown");

            // Define filter query.Criteria
            query.Criteria.AddCondition("dia_jobdestinationvesselid", ConditionOperator.Equal, jobdestination.Id);

            // Add link-entity query_dia_vessel
            var query_dia_vessel = query.AddLink("dia_vessel", "dia_vessel", "dia_vesselid");

            // Add columns to query_dia_vessel.Columns
            query_dia_vessel.Columns.AddColumns("dia_composition");

            var Composition = service.RetrieveMultiple(query);

            return Composition;


        }




    }
}