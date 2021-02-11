using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using EasyData.EntityFrameworkCore;

namespace EasyDataBasicDemo.Models
{
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

        [MetaEntityAttr(DisplayFormat = "{0:C2}")]
        public decimal? UnitPrice { get; set; }

        public short? UnitsInStock { get; set; }

        public short? UnitsOnOrder { get; set; }

        public short? ReorderLevel { get; set; }

        public bool Discontinued { get; set; }
    }


}