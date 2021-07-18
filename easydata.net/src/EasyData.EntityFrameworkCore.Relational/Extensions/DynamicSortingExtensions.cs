using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace EasyData.EntityFrameworkCore
{
    public static class DynamicSortingExtensions
    {
        //Inspired by https://stackoverflow.com/a/31959568/5274

        static readonly MethodInfo OrderByMethod = typeof(Queryable).GetMethods()
            .Where(m => m.Name == "OrderBy" && m.IsGenericMethodDefinition && m.GetParameters().Length == 2)
            .Single();

        static readonly MethodInfo OrderByDescendingMethod = typeof(Queryable).GetMethods()
            .Where(m => m.Name == "OrderByDescending" && m.IsGenericMethodDefinition && m.GetParameters().Length == 2)
            .Single();

        static readonly MethodInfo ThenByMethod = typeof(Queryable).GetMethods()
            .Where(m => m.Name == "ThenBy" && m.IsGenericMethodDefinition && m.GetParameters().Length == 2)
            .Single();

        static readonly MethodInfo ThenByDescendingMethod = typeof(Queryable).GetMethods()
            .Where(m => m.Name == "ThenByDescending" && m.IsGenericMethodDefinition && m.GetParameters().Length == 2)
            .Single();

        public static IOrderedQueryable<TSource> OrderBy<TSource>(this IQueryable<TSource> query, string propertyName)
        {
            return BuildQuery(OrderByMethod, query, propertyName);
        }

        public static IOrderedQueryable<TSource> OrderBy<TSource>(this IQueryable<TSource> query, string propertyName,
            bool isDescending)
        {
            if (isDescending)
                return BuildQuery(OrderByDescendingMethod, query, propertyName);
            else
                return BuildQuery(OrderByMethod, query, propertyName);
        }

        public static IOrderedQueryable<TSource> ThenBy<TSource>(this IQueryable<TSource> query, string propertyName,
            bool isDescending)
        {
            if (isDescending)
                return BuildQuery(ThenByDescendingMethod, query, propertyName);
            else
                return BuildQuery(ThenByMethod, query, propertyName);
        }

        public static IOrderedQueryable<TSource> OrderByDescending<TSource>(this IQueryable<TSource> query,
            string propertyName)
        {
            return BuildQuery(OrderByDescendingMethod, query, propertyName);
        }

        public static IOrderedQueryable<TSource> ThenBy<TSource>(this IQueryable<TSource> query, string propertyName)
        {
            return BuildQuery(ThenByMethod, query, propertyName);
        }

        public static IOrderedQueryable<TSource> ThenByDescending<TSource>(this IQueryable<TSource> query,
            string propertyName)
        {
            return BuildQuery(ThenByDescendingMethod, query, propertyName);
        }

        static IOrderedQueryable<TSource> BuildQuery<TSource>(MethodInfo method, IQueryable<TSource> query,
            string propertyName)
        {
            var entityType = typeof(TSource);

            var propertyInfo = entityType.GetProperty(propertyName);
            if (propertyInfo == null)
                throw new ArgumentOutOfRangeException(nameof(propertyName), "Unknown column " + propertyName);

            var arg = Expression.Parameter(entityType, "x");
            var property = Expression.Property(arg, propertyName);
            var selector = Expression.Lambda(property, new ParameterExpression[] { arg });

            var genericMethod = method.MakeGenericMethod(entityType, propertyInfo.PropertyType);

            return (IOrderedQueryable<TSource>)genericMethod.Invoke(genericMethod, new object[] { query, selector });
        }
    }
}
