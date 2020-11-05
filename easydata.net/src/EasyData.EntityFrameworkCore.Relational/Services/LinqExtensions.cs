using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

using Exp = System.Linq.Expressions.Expression;

namespace EasyData.EntityFrameworkCore.Relational.Services
{

    /// <summary>
    /// Contains options for full text search
    /// </summary>
    public class FullTextSearchOptions
    {

        /// <summary>
        /// Lamda expression, which filters properties to use in full text search
        /// </summary>
        public Func<PropertyInfo, bool> Filter { get; set; }

        /// <summary>
        /// The name of the property to order by the result list
        /// </summary>
        public string OrderBy { get; set; }

        /// <summary>
        /// if set to <c>true</c> then we use descending order
        /// </summary>
        public bool IsDescendingOrder { get; set; } = false;

        /// <summary>
        /// Depth of full text search. 
        /// </summary>
        public int Depth { get; set; } = 0;
    }

    public static class LinqExtensions
    {
        /// <summary>
        /// Filters a sequence of values based on a fulltext search predicate 
        /// </summary>
        /// <typeparam name="T">Any type</typeparam>
        /// <param name="source">The source - some IQueryable object.</param>
        /// <param name="text">The text - meaning of the search</param>
        /// <param name="options">The options for full-text search</param>
        /// <returns></returns>
        public static IQueryable<T> FullTextSearchQuery<T>(this IQueryable<T> source, string text, FullTextSearchOptions options = null)
        {

            var pe = Exp.Parameter(typeof(T), "d");
            var predicateBody = CreateSubExpression(pe, typeof(T), text, options, isQueriable: true);

            if (predicateBody != null) {
                var whereExp = Exp.Lambda<Func<T, bool>>(predicateBody, new ParameterExpression[] { pe });
                source = source.Where(whereExp);
            }

            //Order by Expression
            if (options == null) {
                return source;
            }

            var orderByProperty = options.OrderBy;
            if (string.IsNullOrEmpty(orderByProperty)) {
                orderByProperty = typeof(T).GetProperties().First().Name;
            }

            var property = Exp.Property(pe, orderByProperty);
            var lambda = Exp.Lambda(property, pe);
            var method = options.IsDescendingOrder ? "OrderByDescending" : "OrderBy";
            var orderByExp = Exp.Call(typeof(Queryable), method, new[] { typeof(T), property.Type }, source.Expression, lambda);
            source = source.Provider.CreateQuery<T>(orderByExp) as IOrderedQueryable<T>;
            return source;
        }

        private static Exp CreateSubExpression(Exp pe, Type type, string text, FullTextSearchOptions options, bool isQueriable = false)
        {
            var texts = text.Split(new string[] { "||" }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim().ToLower())
                    .ToList();

            var properties = type.GetProperties().AsEnumerable();
            if (isQueriable) {
                properties = properties.GetMappedProperties();
            }

            Exp predicateBody = null;
            foreach (var prop in properties) {

                //Check if we can use this property in Search
                if (options == null || options.Filter == null || options.Filter.Invoke(prop)) {
                    var paramExp = Exp.Property(pe, prop);

                    if (prop.PropertyType == typeof(string) || prop.PropertyType == typeof(int)
                        || prop.PropertyType == typeof(int?))
                    {

                        Exp notNullExp = null;
                        if (prop.PropertyType == typeof(string)) {
                            Exp nullConst = Exp.Constant(null, typeof(string));
                            notNullExp = Exp.NotEqual(paramExp, nullConst);
                        }

                        Exp toStringExp = paramExp;
                        //Check if property has int type
                        if (prop.PropertyType == typeof(int?) || prop.PropertyType == typeof(int)) {

                            if (!isQueriable) {
                                Exp toNullableIntExp = null;

                                //property should be nullable
                                if (prop.PropertyType == typeof(int)) {
                                    toNullableIntExp = Exp.TypeAs(paramExp, typeof(int?));
                                }

                                Exp valueExp = null;
                                if (toNullableIntExp != null) {
                                    notNullExp = Exp.Property(toNullableIntExp, "HasValue");
                                    valueExp = Exp.Property(toNullableIntExp, "Value");
                                }
                                else {
                                    notNullExp = Exp.Property(paramExp, "HasValue");
                                    valueExp = Exp.Property(paramExp, "Value");
                                }

                                notNullExp = Exp.Equal(notNullExp, Exp.Constant(true, typeof(bool)));

                                var convertToString = typeof(Convert).GetMethod("ToString", new[] { typeof(int) });
                                toStringExp = Exp.Call(convertToString, valueExp);
                            }
                            else {
                                var convertToString = typeof(Convert).GetMethod("ToString", new[] { typeof(int) });
                                toStringExp = Exp.Call(convertToString, Exp.Convert(paramExp, typeof(int)));
                            }
                           
                        }

                        Exp peLower = Exp.Call(toStringExp, typeof(string).GetMethod("ToLower", System.Type.EmptyTypes));

                        Exp conditionExp = null;
                        foreach (var txt in texts) {
                            var constant = Exp.Constant(txt, typeof(string));
                            Exp containsExp = Exp.Call(peLower, typeof(string).GetMethod("Contains", new[] { typeof(string) }), constant);
                            if (conditionExp != null) {
                                conditionExp = Exp.OrElse(conditionExp, containsExp);
                            }
                            else {
                                conditionExp = containsExp;
                            }
                        }

                        Exp andExp = (notNullExp != null) ? Exp.AndAlso(notNullExp, conditionExp) : conditionExp;
                        if (predicateBody != null) {
                            predicateBody = Exp.OrElse(predicateBody, andExp);
                        }
                        else {
                            predicateBody = andExp;
                        }
                    }

                    //If this property is't simple and the depth > 0
                    if (options != null && options.Depth != 0
                        && !prop.PropertyType.IsSimpleType() && !prop.PropertyType.IsEnumerable()) {
                        options.Depth -= 1;
                        var subExp = CreateSubExpression(paramExp, prop.PropertyType, text, options, isQueriable);
                        options.Depth += 1;

                        if (subExp != null) {
                            Exp notNullExp = Exp.NotEqual(paramExp, Exp.Constant(null, typeof(object)));
                            subExp = Exp.AndAlso(notNullExp, subExp);
                            predicateBody = (predicateBody != null) ? Exp.OrElse(predicateBody, subExp) : subExp;
                        }
                    }

                }
            }

            return predicateBody;
        }
    }
}
