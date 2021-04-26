using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.Entities
{
    public class Intake
    {
        public EntityCollection GetTemplateAdditive(IOrganizationService service, EntityReference targetEntity)
        {

            var query = new QueryExpression("dia_jobadditive");
            query.ColumnSet.AllColumns = true;

            // Define filter query.Criteria
            query.Criteria.AddCondition("dia_jobtemplate", ConditionOperator.Equal, targetEntity.Id);

            EntityCollection ResultsTemplate = service.RetrieveMultiple(query);

            return ResultsTemplate;
        }


    }
}
