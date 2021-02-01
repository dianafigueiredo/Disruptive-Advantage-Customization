using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.Entities
{
    public class JobDestinationEntity
    {
        public EntityCollection GetDestinationVesselQuantity(IOrganizationService service, Entity jobDestination, EntityReference destVessel, Entity jobEnt)
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
        }
        public EntityCollection GetSourceVesselQuantity(IOrganizationService service, Entity jobDestination, EntityReference destVessel, Entity jobEnt)
        {
            var queryJobSource = new QueryExpression("dia_jobsourcevessel");
            queryJobSource.ColumnSet = new ColumnSet("dia_quantity");
            queryJobSource.Criteria = new FilterExpression(LogicalOperator.And);
            queryJobSource.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, destVessel.Id);

            var jobLinkEntitySource = new LinkEntity("dia_jobdestinationvessel", "dia_job", "dia_job", "dia_jobid", JoinOperator.Inner);
            jobLinkEntitySource.Columns = new ColumnSet(false);
            jobLinkEntitySource.LinkCriteria = new FilterExpression(LogicalOperator.And);
            jobLinkEntitySource.LinkCriteria.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, (DateTime)jobEnt["dia_schelduledstart"]);
            jobLinkEntitySource.LinkCriteria.AddCondition("statuscode", ConditionOperator.Equal, 914440001);//Completed
            queryJobSource.LinkEntities.Add(jobLinkEntitySource);

            var vesselEmpty = service.RetrieveMultiple(queryJobSource);

            return vesselEmpty;
        }






    }
}