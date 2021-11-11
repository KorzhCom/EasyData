using System;
using EasyData.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace EasyDataBasicDemo.Models
{
    [Keyless]
    [MetaEntity(DisplayName = "City", DisplayNamePlural = "Cities")]
    public class CityEntity
    {
        public string Country { get; set; }

        public string City { get; set; }
    }
}
