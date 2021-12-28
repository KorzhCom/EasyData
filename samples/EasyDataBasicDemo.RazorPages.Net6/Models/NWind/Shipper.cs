using System.ComponentModel.DataAnnotations.Schema;

using EasyData.EntityFrameworkCore;

namespace EasyDataBasicDemo.Models
{
    [MetaEntity(false)]
    public class Shipper
    {
        [Column("ShipperID")]
        public int Id { get; set; }

        public string CompanyName { get; set; }

        public string Phone { get; set; }
    }
}
