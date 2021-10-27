using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using EasyData.Services;

namespace EasyData.Core.Test.Factories
{
    /// <summary>
    /// Test <see cref="EntityPropertyMetaBuilder"/> factory.
    /// </summary>
    class EntityPropertyMetaBuilderFactory : IFactory<EntityPropertyMetaBuilder>
    {
        private PropertyInfo _propertyInfo;

        /// <inheritdoc />
        public EntityPropertyMetaBuilder Create()
        {
            var entityPropertyMetaBuilder = new EntityPropertyMetaBuilder(_propertyInfo);
            entityPropertyMetaBuilder.SetDisplayName(Faker.Lorem.Sentence());
            entityPropertyMetaBuilder.SetDescription(Faker.Lorem.Sentence());
            entityPropertyMetaBuilder.SetDisplayFormat(Faker.Lorem.GetFirstWord());
            entityPropertyMetaBuilder.SetEditable(Faker.Boolean.Random());
            entityPropertyMetaBuilder.SetEnabled(Faker.Boolean.Random());
            entityPropertyMetaBuilder.SetIndex(Faker.RandomNumber.Next());
            entityPropertyMetaBuilder.SetShowInLookup(Faker.Boolean.Random());
            entityPropertyMetaBuilder.SetShowOnCreate(Faker.Boolean.Random());
            entityPropertyMetaBuilder.SetShowOnView(Faker.Boolean.Random());
            entityPropertyMetaBuilder.SetShowOnEdit(Faker.Boolean.Random());
            entityPropertyMetaBuilder.SetSorting(Faker.RandomNumber.Next());

            return entityPropertyMetaBuilder;
        }

        /// <summary>
        /// Create new factory instance.
        /// </summary>
        /// <param name="propertyInfo">Proprepty information.</param>
        public EntityPropertyMetaBuilderFactory(PropertyInfo propertyInfo)
        {
            _propertyInfo = propertyInfo;
        }
    }
}
