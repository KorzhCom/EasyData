using System;
using System.Collections.Generic;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.Core.Test.Factories
{
    /// <summary>
    /// Test <see cref="EntityMetadataDescriptor"/> factory.
    /// </summary>
    class EntityMetadataDescriptorFactory : IFactory<EntityMetadataDescriptor>
    {
        /// <inheritdoc />
        public EntityMetadataDescriptor Create()
        {
            var entityMetadataDescriptor = new EntityMetadataDescriptor
            {
                DisplayName = Faker.Lorem.Sentence(),
                DisplayNamePlural = Faker.Lorem.Sentence(),
                IsEnabled = Faker.Boolean.Random(),
                Description = Faker.Lorem.Sentence(),
            };

            return entityMetadataDescriptor;
        }
    }
}
