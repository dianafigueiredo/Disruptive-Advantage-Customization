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
    }
}
