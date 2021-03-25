using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;

namespace Disruptive_Advantage_Customization.BusinessLogicHelper
{
	public class JsonHelper
	{
		/// <summary>
		/// JSON Serialization
		/// </summary>
		public static string JsonSerializer<T>(T t)
		{
			string jsonString = String.Empty;

			using (MemoryStream ms = new MemoryStream())
			{
				DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(T));
				ser.WriteObject(ms, t);
				jsonString = Encoding.UTF8.GetString(ms.ToArray());
			}

			return jsonString;
		}

		/// <summary>
		/// JSON Deserialization
		/// </summary>
		public static T JsonDeserialize<T>(string jsonString)
		{
			DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(T));
			using (MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(jsonString)))
			{
				T obj = (T)ser.ReadObject(ms);
				return obj;
			}
		}
	}
}
