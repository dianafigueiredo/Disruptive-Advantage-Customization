using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.Entities
{
    public class AnalysisTest
    {
        public EntityCollection GetAnalysisTesteFields(IOrganizationService service, Entity targetEntity)
        {
            var query = new QueryExpression("dia_analysistests");
            query.ColumnSet.AddColumns("dia_metric", "dia_value", "dia_unit", "dia_passrangefrom", "dia_passrangeto");
            query.Criteria.AddCondition("dia_analysistemplate", ConditionOperator.Equal, targetEntity.Id);

            var AnalysisFields = service.RetrieveMultiple(query);

            return AnalysisFields;
        }

    }
}
