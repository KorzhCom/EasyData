using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData.Services
{
    public class EasySorter
    {
       
        public SortDirection Direction { get; set; } = SortDirection.Ascending;

        public string FieldName { get; set; }
    }
}
