using System;
using System.Collections.Generic;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.Core.Test.Factories
{
    /// <summary>
    /// Test <see cref="EntityMetadataDescriptor{T}"/> factory.
    /// </summary>
    class EntityMetadataDescriptorFactory<T> : IFactory<EntityMetadataDescriptor<T>>
    {
        /// <inheritdoc />
        public EntityMetadataDescriptor<T> Create()
        {
            var entityMetadataDescriptor = new EntityMetadataDescriptor<T>
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
