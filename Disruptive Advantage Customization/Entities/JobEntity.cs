using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.Entities
{
    public class JobEntity
    {
        public EntityCollection GetDestinationQuantity(IOrganizationService service, Entity targetEntity) {
       
            var queryJobDestinationVessel = new QueryExpression("dia_jobdestinationvessel");
            queryJobDestinationVessel.ColumnSet.AddColumns("dia_jobdestinationvesselid", "dia_vessel", "dia_quantity", "dia_prevolume", "dia_stage", "dia_batch");
            queryJobDestinationVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);
            var query_dia_batch = queryJobDestinationVessel.AddLink("dia_batch", "dia_batch", "dia_batchid");
            query_dia_batch.Columns.AddColumns("dia_stage");
            query_dia_batch.EntityAlias = "stage";
            var DestinationQuantity = service.RetrieveMultiple(queryJobDestinationVessel);
            
            return DestinationQuantity;
        }

        public EntityCollection GetSourceQuantity(IOrganizationService service, Entity targetEntity) {

            var querySourceVessel = new QueryExpression("dia_jobsourcevessel");
            querySourceVessel.ColumnSet.AddColumns("dia_jobsourcevesselid", "dia_vessel", "dia_quantity", "dia_stage", "dia_batch");
            querySourceVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);
            var query_dia_batch = querySourceVessel.AddLink("dia_batch", "dia_batch", "dia_batchid");
            query_dia_batch.Columns.AddColumns("dia_stage");
            query_dia_batch.EntityAlias = "stage";
            EntityCollection resultsSourceVessel = service.RetrieveMultiple(querySourceVessel);

            return resultsSourceVessel;
        }

        public EntityCollection GetAdditive(IOrganizationService service, Entity targetEntity) {

            var queryJobAdditive = new QueryExpression("dia_jobadditive");
            queryJobAdditive.ColumnSet.AddColumns("dia_jobadditiveid", "dia_additiveid", "dia_quantity");
            queryJobAdditive.Criteria.AddCondition("dia_jobid", ConditionOperator.Equal, targetEntity.Id);
            EntityCollection ResultsAdditives = service.RetrieveMultiple(queryJobAdditive);

            return ResultsAdditives;
        }
        public EntityCollection GetAdditiveVessel(IOrganizationService service, EntityReference targetEntity)
        {

            var queryJobAdditive = new QueryExpression("dia_jobadditive");
            queryJobAdditive.ColumnSet.AddColumns("dia_quantity", "dia_jobid", "dia_vessel", "dia_additiveid");
            queryJobAdditive.Criteria.AddCondition("dia_vessel", ConditionOperator.Equal, targetEntity.Id);
            EntityCollection ResultsAdditives = service.RetrieveMultiple(queryJobAdditive);

            return ResultsAdditives;
        }

        public EntityCollection GetAnnotation(IOrganizationService service, EntityReference targetEntity)
        {

            // Instantiate QueryExpression query
            var query = new QueryExpression("annotation");
           

            // Add all columns to query.ColumnSet
            query.ColumnSet.AllColumns = true;

            // Define filter query.Criteria
            query.Criteria.AddCondition("objectid", ConditionOperator.Equal, targetEntity.Id);


            EntityCollection ResultsTemplate = service.RetrieveMultiple(query);

            return ResultsTemplate;
        }


        public EntityCollection GetTask(IOrganizationService service, EntityReference targetEntity)
        {

            // Instantiate QueryExpression query
            var query = new QueryExpression("task");


            // Add all columns to query.ColumnSet
            query.ColumnSet.AllColumns = true;

            // Define filter query.Criteria
            query.Criteria.AddCondition("regardingobjectid", ConditionOperator.Equal, targetEntity.Id);

            EntityCollection ResultsTemplate = service.RetrieveMultiple(query);

            return ResultsTemplate;
        }


        public EntityCollection GetAdditive(IOrganizationService service, EntityReference targetEntity)
        {
            var query = new QueryExpression("dia_jobadditive");
            query.ColumnSet.AddColumns("dia_quantity");
            query.Criteria.AddCondition("dia_jobid", ConditionOperator.Equal, targetEntity.Id);

            EntityCollection ResultsAdditive = service.RetrieveMultiple(query);

            return ResultsAdditive;
        }
        public EntityCollection GetStorageGivenAdditive(IOrganizationService service, Entity targetEntity)
        {
            var query = new QueryExpression("dia_storage");
            query.TopCount = 1;
            query.ColumnSet.AddColumns("dia_storageid", "dia_additive");
            query.Criteria.AddCondition("dia_additive", ConditionOperator.Equal, targetEntity.Id);


            EntityCollection ResultsAdditive = service.RetrieveMultiple(query);

            return ResultsAdditive;
        }
    }
}
