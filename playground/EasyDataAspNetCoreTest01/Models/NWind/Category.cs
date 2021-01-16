using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

using EasyData.EntityFrameworkCore;

namespace EasyDataBasicDemo.Models
{
    [MetaEntity(Description = "Categories of Product")]
    public class Category
    {

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("CategoryID")]
        public int Id { get; set; }
  
        [MetaEntityAttr(ShowOnCreate = false, ShowOnEdit = false, ShowOnView = false)]
        public string CategoryName { get; set; }

        [MetaEntityAttr(Editable = false)]
        public string Description { get; set; }

        [ScaffoldColumn(false)]
        public byte[] Picture { get; set; } 

    }
}
