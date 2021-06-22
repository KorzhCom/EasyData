using EasyData.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EasyDataBasicDemo.Models
{

    public class Order
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("OrderID")]
        public int Id { get; set; }

        [NotMapped]
        public string Name {
            get {
                return string.Format("{0:0000}-{1:yyyy-MM-dd}", this.Id, this.OrderDate);
            }
        }
        
        [Display(Name = "Ordered")]
        [MetaEntityAttr(Editable = false, DisplayFormat = "{0:D}")]
        public DateTime? OrderDate { get; set; }

        [Display(Name = "Required")]
        public DateTime? RequiredDate { get; set; }

        [Display(Name = "Shipped")]
        public DateTime? ShippedDate { get; set; }

        public decimal? Freight { get; set; }

        public string CustomerID { get; set; }

        [ForeignKey("CustomerID")]
        [MetaEntityAttr( Editable = false )]
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

        public TimeSpan OrderTime { get; set; }

        public OrderType OrderType { get; set; }
    }

    public enum OrderType 
    { 
        FirstSale = 1,

        Renewal = 2,

        Upgrade = 3
    }
}