using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

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
            /*var query = new QueryExpression("dia_jobdestinationvessel");
            query.ColumnSet.AddColumns("dia_vessel", "dia_quantity");
            query.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, vessel.Id);
            query.Criteria.AddCondition("statecode", ConditionOperator.Equal, 0);
            query.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, vessel.Id);
            var query_dia_job = query.AddLink("dia_job", "dia_job", "dia_jobid");
            query_dia_job.EntityAlias = "Job";
            query_dia_job.Columns.AddColumns("dia_type");
            query_dia_job.LinkCriteria.FilterOperator = LogicalOperator.Or;
            query_dia_job.LinkCriteria.AddCondition("dia_type", ConditionOperator.Equal, 914440003);
            query_dia_job.LinkCriteria.AddCondition("dia_type", ConditionOperator.Equal, 914440001);
            //query_dia_job.LinkCriteria.AddCondition("statuscode", ConditionOperator.Equal, 914440001);
            var query_dia_job_LinkCriteria_0 = new FilterExpression();
            query_dia_job.LinkCriteria.AddFilter(query_dia_job_LinkCriteria_0);
            // Define filter query_dia_job_LinkCriteria_0
            //query_dia_job_LinkCriteria_0.AddCondition("statuscode", ConditionOperator.Equal, 914440000);
            query_dia_job_LinkCriteria_0.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, jobEnt.GetAttributeValue<DateTime>("dia_schelduledstart"));
            */

            var query = new QueryExpression("dia_jobdestinationvessel");
            query.ColumnSet.AddColumns("dia_vessel", "dia_quantity");
            query.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, vessel.Id);
            query.Criteria.AddCondition("statecode", ConditionOperator.Equal, 0);

            var query_dia_job = query.AddLink("dia_job", "dia_job", "dia_jobid");
            query_dia_job.Columns.AddColumns("dia_type");
            query_dia_job.LinkCriteria.FilterOperator = LogicalOperator.Or;
            query_dia_job.LinkCriteria.AddCondition("dia_type", ConditionOperator.Equal, 914440003);
            query_dia_job.LinkCriteria.AddCondition("dia_type", ConditionOperator.Equal, 914440001);

            var query_dia_job_LinkCriteria_1 = new FilterExpression();
            query_dia_job.LinkCriteria.AddFilter(query_dia_job_LinkCriteria_1);
            query_dia_job_LinkCriteria_1.AddCondition("dia_schelduledstart", ConditionOperator.LessEqual, jobEnt.GetAttributeValue<DateTime>("dia_schelduledstart"));


            EntityCollection resultsquery = service.RetrieveMultiple(query);

            return resultsquery;
        }

        public EntityCollection GetQuantity(IOrganizationService service, EntityReference job)
        {

            // Instantiate QueryExpression query
            var fetchXml = $@"
             <fetch aggregate='true'>
             <entity name='dia_jobsourcevessel'>
             <attribute name='dia_quantity' alias='Quantity' aggregate='sum' />
             <filter>
             <condition attribute='dia_job' operator='eq' value='{job.Id}'/>
             </filter>
             </entity>
             </fetch>";
            
            var Quantity = service.RetrieveMultiple(new FetchExpression(fetchXml));

            return Quantity;


        }
    }
}
