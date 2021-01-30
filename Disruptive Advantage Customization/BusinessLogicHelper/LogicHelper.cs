using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.BusinessLogicHelper
{
    public class LogicHelper
    {
        /// <summary>
        /// Function to perform the sum of a Collumn
        /// </summary>
        /// <param name="dataCollection">EntityCollection</param>
        /// <param name="fieldName">AttributName</param>
        /// <returns>SUM of a collumn</returns>
        public decimal? SumOfQuantities(EntityCollection dataCollection, string fieldName)
        {
            var result = 0m;
            foreach (var item in dataCollection.Entities)
            {
                result += (decimal)item[fieldName];
            }
            return result;
        }
    }
}
