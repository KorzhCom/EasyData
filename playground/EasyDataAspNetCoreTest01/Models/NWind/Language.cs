using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using EasyData;
using EasyData.EntityFrameworkCore;

namespace EasyDataBasicDemo.Models
{
    public class Language
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ShortName { get; set; }

        public Guid GuidTest { get; set; }
    }
}
