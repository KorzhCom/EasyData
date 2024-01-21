using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData
{
    //create an interface that defines a storage service for DataSource objects with all CRUD operations

    public interface IDataSourceStorage
    {
        //define a method to get a DataSource object by its id
        DataSource Get(string id);

        //define a method to get a list of DataSource objects available in the storage
        IEnumerable<DataSource> ListDataSources();

        //define a method to add a DataSource object
        void Add(DataSource ds);

        //define a method to update a DataSource object
        void Update(DataSource ds);

        //define a method to delete a DataSource object
        void Delete(string id);
    }
}
