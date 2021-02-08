using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.Entities
{
    public class JobSourceEntity
    {
        public EntityCollection GetJobSourceVessel(IOrganizationService service, EntityReference jobRef)
        {
            var query = new QueryExpression("dia_jobsourcevessel");
            query.ColumnSet.AddColumns("dia_quantity");
            query.Criteria.AddCondition("dia_job", ConditionOperator.Equal, jobRef.Id);

            EntityCollection resultsquery = service.RetrieveMultiple(query);

            return resultsquery;
        }
        public EntityCollection GetVesselJobAsDestination(IOrganizationService service, EntityReference vessel, Entity jobEnt)
        {
            var query = new QueryExpression("dia_jobsourcevessel");
            query.ColumnSet.AddColumns("dia_vessel", "dia_quantity");
            query.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, vessel.Id);
            var query_dia_job = query.AddLink("dia_job", "dia_job", "dia_jobid");
            query_dia_job.EntityAlias = "Job";
            query_dia_job.Columns.AddColumns("dia_type");
            query_dia_job.LinkCriteria.FilterOperator = LogicalOperator.Or;
            query_dia_job.LinkCriteria.AddCondition("dia_type", ConditionOperator.Equal, 914440003);
            query_dia_job.LinkCriteria.AddCondition("dia_type", ConditionOperator.Equal, 914440001);
            query_dia_job.LinkCriteria.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, jobEnt.GetAttributeValue<DateTime>("dia_schelduledstart"));

            EntityCollection resultsquery = service.RetrieveMultiple(query);

            return resultsquery;
        }
    }
}
