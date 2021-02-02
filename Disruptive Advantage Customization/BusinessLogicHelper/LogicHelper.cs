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
        /// <summary>
        /// Function to calculate the final occupation of the vessel
        /// </summary>
        /// <param name="capVessel">EntityCollection</param>
        /// <param name="occVessel">AttributName</param>
        /// <param name="qtdJobDestVessel">AttributName</param>
        /// <param name="qtdFill">AttributName</param>
        /// <param name="qtdDrop">AttributName</param>
        /// <returns>Final occupation</returns>
        public decimal? FinalOccupation(decimal capVessel, decimal occVessel, decimal qtdJobDestVessel, decimal? qtdFill, decimal? qtdDrop)
        {
            var finalOccupation = capVessel - occVessel - qtdJobDestVessel - qtdFill + qtdDrop;

            return finalOccupation;
        }
    }
}
