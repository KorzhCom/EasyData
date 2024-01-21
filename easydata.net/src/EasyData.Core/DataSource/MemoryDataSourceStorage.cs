using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData
{
    public class MemoryDataSourceStorage : IDataSourceStorage
    {
        //create a dictionary to store DataSource objects
        private readonly Dictionary<string, DataSource> _dataSources = new Dictionary<string, DataSource>();

        //implement the Get method
        public DataSource Get(string id)
        {
            if (_dataSources.TryGetValue(id, out DataSource ds)) {
                return ds;
            }
            return null;
        }

        //implement the ListDataSources method
        public IEnumerable<DataSource> ListDataSources()
        {
            return _dataSources.Values;
        }

        //implement the Add method
        public void Add(DataSource ds)
        {
            _dataSources[ds.Id] = ds;
        }

        //implement the Update method
        public void Update(DataSource ds)
        {
            _dataSources[ds.Id] = ds;
        }

        //implement the Delete method
        public void Delete(string id)
        {
            _dataSources.Remove(id);
        }
    }


}
