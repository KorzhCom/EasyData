using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace EasyDataBasicDemo.Models
{

    public class Category
    {

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("CategoryID")]
        public int Id { get; set; }
  
        public string CategoryName { get; set; }
        
        public string Description { get; set; }

        [ScaffoldColumn(false)]
        public byte[] Picture { get; set; } 

    }
}
