using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using EasyData.Services;

namespace EasyData.Core.Test.Factories
{
    class EntityPropertyMetaBuilderFactory: IFactory<EntityPropertyMetaBuilder>
    {
        public EntityPropertyMetaBuilder Object { get; }

        public EntityPropertyMetaBuilderFactory(PropertyInfo propertyInfo)
        {
            var entityPropertyMetaBuilder = new EntityPropertyMetaBuilder(propertyInfo);
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

            Object = entityPropertyMetaBuilder;
        }
    }
}
