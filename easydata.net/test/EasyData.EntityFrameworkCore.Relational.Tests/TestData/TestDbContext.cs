using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using NodaTime;

using Microsoft.EntityFrameworkCore;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    class TestDbContext: DbContext
    {
        public TestDbContext(DbContextOptions options)
           : base(options)
        { }

        #region NWind
        public DbSet<Category> Categories { get; set; }

        public DbSet<Customer> Customers { get; set; }

        public DbSet<Employee> Employees { get; set; }

        public DbSet<Order> Orders { get; set; }

        public DbSet<Product> Products { get; set; }

        public DbSet<OrderDetail> OrderDetails { get; set; }

        public DbSet<Shipper> Shippers { get; set; }

        public DbSet<Supplier> Suppliers { get; set; }

        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<OrderDetail>()
                .ToTable("Order_Details")
                .HasKey(od => new { od.OrderID, od.ProductID });
        }

        public static TestDbContext Create()
        {
            return new TestDbContext(new DbContextOptionsBuilder()
                .UseSqlite("Data Source = :memory:", opts => opts.UseNodaTime())
                .Options);
        }
    }

    [MetaEntity(DisplayNamePlural = "Categories", Description = "Categories description")]
    public class Category
    {

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("CategoryID")]
        public int Id { get; set; }

        public string CategoryName { get; set; }

        [MetaEntityAttr(Index=2)]
        public string Description { get; set; }

        [ScaffoldColumn(false)]
        public byte[] Picture { get; set; }

    }

    [DisplayColumn("Name")]
    public class Customer
    {
        [Column("CustomerID")]
        public string Id { get; set; }

        public Instant TimeCreated { get; set; }

        [Display(Name = "Company Name")]
        public string CompanyName { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string Region { get; set; }

        public string PostalCode { get; set; }

        public string Country { get; set; }

        public string ContactName { get; set; }

        public string ContactTitle { get; set; }

        public string Phone { get; set; }

        public string Fax { get; set; }
    }

    [DisplayColumn("FirstName")]
    public class Employee
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("EmployeeID")]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Last name")]
        [MetaEntityAttr(ShowInLookup = true)]
        public string LastName { get; set; }

        [Required]
        [Display(Name = "First name")]
        public string FirstName { get; set; }

        [NotMapped]
        public string FullName
        {
            get {
                string res = this.FirstName;

                if (!string.IsNullOrEmpty(res))
                    res += " ";

                if (!string.IsNullOrEmpty(this.LastName))
                    res += this.LastName;
                return res;
            }
        }


        [MaxLength(30)]
        public string Title { get; set; }

        public string TitleOfCourtesy { get; set; }

        [Display(Name = "Birth date")]
        public DateTime? BirthDate { get; set; }

        public DateTime? HireDate { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string Region { get; set; }

        public string PostalCode { get; set; }

        public string Country { get; set; }

        [MaxLength(24)]
        public string HomePhone { get; set; }

        [MaxLength(4)]
        public string Extension { get; set; }

        [ScaffoldColumn(false)]
        public byte[] Photo { get; set; }

        public string PhotoPath { get; set; }

        public string Notes { get; set; }

        [ScaffoldColumn(false)]
        public int? ReportsTo { get; set; }

        [ForeignKey("ReportsTo")]
        public virtual Employee Manager { get; set; }

        public virtual ICollection<Order> Orders { get; set; }
    }

    public class Order
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("OrderID")]
        public int Id { get; set; }

        [NotMapped]
        public string Name
        {
            get {
                return string.Format("{0:0000}-{1:yyyy-MM-dd}", this.Id, this.OrderDate);
            }
        }

        [Display(Name = "Ordered")]
        [MetaEntityAttr(Editable = false)]
        public DateTime? OrderDate { get; set; }

        [Display(Name = "Required")]
        public DateTime? RequiredDate { get; set; }

        [Display(Name = "Shipped")]
        public DateTime? ShippedDate { get; set; }

        public decimal? Freight { get; set; }

        public string CustomerID { get; set; }

        [ForeignKey("CustomerID")]
        [MetaEntityAttr(Editable = false)]
        public virtual Customer Customer { get; set; }

        public int? EmployeeID { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employee Employee { get; set; }

        public virtual List<OrderDetail> Items { get; set; }

        [ScaffoldColumn(false)]
        public int? ShipVia { get; set; }

        public string ShipName { get; set; }

        public string ShipAddress { get; set; }

        public string ShipCity { get; set; }

        public string ShipRegion { get; set; }

        public string ShipPostalCode { get; set; }

        public string ShipCountry { get; set; }

        // public OrderType OrderType { get; set; }
    }

    public enum OrderType
    {
        FirstSale = 1,

        Renewal = 2,

        Upgrade = 3
    }

    public class OrderDetail
    {
        public int OrderID { get; set; }
        public virtual Order Order { get; set; }

        public int ProductID { get; set; }
        public virtual Product Product { get; set; }

        public decimal UnitPrice { get; set; }

        public short Quantity { get; set; }

        public float Discount { get; set; }
    }

    [DisplayColumn("Name")]
    public class Product
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("ProductID")]
        public int Id { get; set; }

        [Column("ProductName")]
        public string Name { get; set; }

        [ScaffoldColumn(false)]
        public int? SupplierID { get; set; }


        [ForeignKey("SupplierID")]
        public virtual Supplier Supplier { get; set; }

        public int? CategoryID { get; set; }

        [ForeignKey("CategoryID")]
        public virtual Category Category { get; set; }

        public string QuantityPerUnit { get; set; }

        public decimal? UnitPrice { get; set; }

        public short? UnitsInStock { get; set; }

        public short? UnitsOnOrder { get; set; }

        public short? ReorderLevel { get; set; }

        public bool Discontinued { get; set; }
    }

    public class Shipper
    {
        [Column("ShipperID")]
        public int Id { get; set; }

        public string CompanyName { get; set; }

        public string Phone { get; set; }
    }

    public class Supplier
    {

        [Column("SupplierID")]
        public int Id { get; set; }

        public string CompanyName { get; set; }

        public string ContactName { get; set; }

        public string ContactTitle { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string Region { get; set; }

        public string PostalCode { get; set; }

        public string Country { get; set; }

        public string Phone { get; set; }

        public string Fax { get; set; }

        public string HomePage { get; set; }
    }
}
