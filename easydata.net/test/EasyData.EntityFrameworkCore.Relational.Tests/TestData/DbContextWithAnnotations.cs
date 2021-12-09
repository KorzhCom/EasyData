using System;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    public class DbContextWithAnnotations : DbContext
    {
        public DbContextWithAnnotations(DbContextOptions options)
            : base(options)
        { }

        public DbSet<CategoryWithAnnotations> Categories { get; set; }

        public DbSet<CustomerWithAnnotations> Customers { get; set; }

        public static DbContextWithAnnotations Create()
        {
            return new DbContextWithAnnotations(new DbContextOptionsBuilder()
                .UseSqlite("Data Source = :memory:")
                .Options);
        }
    }

    [MetaEntity(Enabled = false)]
    public class CategoryWithAnnotations
    {

        public int Id { get; set; }

        public string CategoryName { get; set; }

        public string Description { get; set; }

        public byte[] Picture { get; set; }

    }

    [MetaEntity(Description = "Test Description", DisplayName = "Test")]
    public class CustomerWithAnnotations
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
