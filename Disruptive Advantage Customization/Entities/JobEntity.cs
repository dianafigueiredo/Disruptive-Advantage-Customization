﻿using Microsoft.Xrm.Sdk.Query;
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
            queryJobDestinationVessel.ColumnSet.AddColumns("dia_jobdestinationvesselid", "dia_vessel", "dia_quantity");
            queryJobDestinationVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);
            var DestinationQuantity = service.RetrieveMultiple(queryJobDestinationVessel);

            return DestinationQuantity;
        }

        public EntityCollection GetSourceQuantity(IOrganizationService service, Entity targetEntity) {

            var querySourceVessel = new QueryExpression("dia_jobsourcevessel");
            querySourceVessel.ColumnSet.AddColumns("dia_jobsourcevesselid", "dia_vessel", "dia_quantity");
            querySourceVessel.Criteria.AddCondition("dia_job", ConditionOperator.Equal, targetEntity.Id);
            EntityCollection resultsSourceVessel = service.RetrieveMultiple(querySourceVessel);

            return resultsSourceVessel;
        }

        public EntityCollection GetAdditive(IOrganizationService service, Entity targetEntity) {

            var queryJobAdditive = new QueryExpression("dia_jobadditive");
            queryJobAdditive.ColumnSet.AddColumns("dia_jobadditiveid");
            queryJobAdditive.Criteria.AddCondition("dia_jobid", ConditionOperator.Equal, targetEntity.Id);
            EntityCollection ResultsAdditives = service.RetrieveMultiple(queryJobAdditive);

            return ResultsAdditives;


        }
    }
}