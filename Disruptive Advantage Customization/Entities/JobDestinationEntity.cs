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
        public EntityCollection GetVesselQuantity(IOrganizationService service, Entity jobDestination)
        {
            
            var destVessel = (EntityReference)jobDestination["dia_vessel"];
            //var qtdDestination = (decimal)jobDestination.Attribute["dia_quantity"] ou assim ou com o getAttributeValue não várias maneiras no mesmo codigo;
            var qtdDestination = (decimal)jobDestination["dia_quantity"];
            var jobRef = (EntityReference)jobDestination["dia_job"];
            var jobEnt = service.Retrieve(jobRef.LogicalName, jobRef.Id, new ColumnSet("dia_schelduledstart", "dia_quantity", "dia_type"));

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

       




    }
}
