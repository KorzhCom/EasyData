using System;
using System.Collections.Generic;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.Core.Test.Factories
{
    /// <summary>
    /// Test <see cref="EntityPropertyMetadataDescriptor"/> factory.
    /// </summary>
    class EntityPropertyMetadataDescriptorFactory : IFactory<EntityPropertyMetadataDescriptor>
    {
        /// <inheritdoc />
        public EntityPropertyMetadataDescriptor Create()
        {
            var entityPropertyMetadataDescriptor = new EntityPropertyMetadataDescriptor
            {
                IsEnabled = Faker.Boolean.Random(),
                DisplayName = Faker.Lorem.Sentence(),
                DisplayFormat = Faker.Lorem.Sentence(),
                Description = Faker.Lorem.Sentence(),
                IsEditable = Faker.Boolean.Random(),
                Index = Faker.RandomNumber.Next(),
                ShowInLookup = Faker.Boolean.Random(),
                ShowOnView = Faker.Boolean.Random(),
                ShowOnEdit = Faker.Boolean.Random(),
                ShowOnCreate = Faker.Boolean.Random(),
                Sorting = Faker.RandomNumber.Next()
            };

            return entityPropertyMetadataDescriptor;
        }
    }
}
