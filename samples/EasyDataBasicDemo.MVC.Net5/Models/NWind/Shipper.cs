using System.ComponentModel.DataAnnotations.Schema;

namespace EasyDataBasicDemo.Models
{
    public class Shipper
    {
        [Column("ShipperID")]
        public int Id { get; set; }

        public string CompanyName { get; set; }

        public string Phone { get; set; }
    }
}
