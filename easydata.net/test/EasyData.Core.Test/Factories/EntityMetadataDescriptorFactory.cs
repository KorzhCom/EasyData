using System;
using System.Collections.Generic;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.Core.Test.Factories
{
    class EntityMetadataDescriptorFactory: IFactory<EntityMetadataDescriptor>
    {
        public EntityMetadataDescriptor Object { get; }

        public EntityMetadataDescriptorFactory()
        {
            var entityMetadataDescriptor = new EntityMetadataDescriptor
            {
                DisplayName = Faker.Lorem.Sentence(),
                DisplayNamePlural = Faker.Lorem.Sentence(),
                IsEnabled = Faker.Boolean.Random(),
                Description = Faker.Lorem.Sentence(),
            };

            Object = entityMetadataDescriptor;
        }
    }
}
