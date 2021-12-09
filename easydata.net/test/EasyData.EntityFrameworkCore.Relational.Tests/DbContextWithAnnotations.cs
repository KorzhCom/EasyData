using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    public class DbContextWithAnnotations : DbContext
    {
        public DbContextWithAnnotations(DbContextOptions options)
            : base(options)
        { }

        public DbSet<CategoryAttributeTest> Categories { get; set; }

        public DbSet<CustomerAttributeTest> Customers { get; set; }

        public static DbContextWithAnnotations Create()
        {
            return new DbContextWithAnnotations(new DbContextOptionsBuilder()
                .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=TestDB;Trusted_Connection=True;")
                .Options);
        }
    }

    [MetaEntity(Enabled = false)]
    public class CategoryAttributeTest
    {

        public int Id { get; set; }

        public string CategoryName { get; set; }

        public string Description { get; set; }

        public byte[] Picture { get; set; }

    }

    [MetaEntity(Description = "Test Description", DisplayName = "Test")]
    public class CustomerAttributeTest
    {
        public string Id { get; set; }

        public string CompanyName { get; set; }

        public string Address { get; set; }

        [MetaEntityAttr(Enabled = false)]
        public string City { get; set; }

        [MetaEntityAttr(ShowOnView = false, DisplayName = "Test", ShowInLookup = true, Editable = false)]
        public string Region { get; set; }

        public string PostalCode { get; set; }
        
        public string Country { get; set; }

        public string ContactName { get; set; }

        public string ContactTitle { get; set; }

        public string Phone { get; set; }

        public string Fax { get; set; }
    }
}
