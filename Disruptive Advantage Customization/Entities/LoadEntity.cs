using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.Entities
{
   public class LoadEntity
    {
        public EntityCollection GetTotal(IOrganizationService service, EntityReference load) {
          
            // Instantiate QueryExpression query
            var query = new QueryExpression("dia_load");
           

            // Add columns to query.ColumnSet
            query.ColumnSet.AddColumns("dia_totalgross", "dia_totaltare", "dia_totalmog", "dia_totalnet");

            // Define filter query.Criteria
            query.Criteria.AddCondition("dia_loadid", ConditionOperator.Equal, load.Id);

            EntityCollection total = service.RetrieveMultiple(query);

            return total;
        }
    }
}
