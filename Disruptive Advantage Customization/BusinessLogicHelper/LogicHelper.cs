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
        public decimal? SumOfQuantities(EntityCollection dataCollection, string fieldName, ITracingService tracingService)
        {
            tracingService.Trace("SumOfQuantities: " + dataCollection.Entities.Count);
            decimal? result = 0m;

            foreach (var item in dataCollection.Entities)
            {
                if (!item.Contains(fieldName)) continue;
                result += (decimal?)item[fieldName];
            }
            return result;
        }
        /// <summary>
        /// Function to calculate the final occupation of the vessel
        /// </summary>
        /// <param name="capVessel">EntityCollection</param>
        /// <param name="occVessel">AttributeName</param>
        /// <param name="qtdJobDestVessel">AttributeName</param>
        /// <param name="qtdFill">AttributeName</param>
        /// <param name="qtdDrop">AttributeName</param>
        /// <returns>Final occupation</returns>
        public decimal? FinalOccupation(decimal capVessel, decimal occVessel, decimal qtdJobDestVessel, decimal? qtdFill, decimal? qtdDrop)
        {
            var finalOccupation = capVessel - occVessel - qtdJobDestVessel - qtdFill + qtdDrop;

            return finalOccupation;
        }
        public decimal? VesselOccupation(EntityCollection vesselAsDestination)
        {
            decimal occupation = 0;

            foreach (var vessel in vesselAsDestination.Entities)
            {
                occupation += vessel.GetAttributeValue<decimal>("dia_quantity");
            }

            return occupation;
        }
    }
}
