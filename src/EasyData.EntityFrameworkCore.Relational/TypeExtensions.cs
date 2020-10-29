using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace EasyData.EntityFrameworkCore
{
    public static class TypeExtensions
    {
        /// <summary>
        /// Determines whether the type is inherited from another type specified by the specified full type name.
        /// </summary>
        /// <param name="type">The type to check the inheritence for.</param>
        /// <param name="fullTypeName">Full name of the type.</param>
        /// <returns><c>true</c> if is inherited from the type specified byt its full type name; otherwise, <c>false</c>.</returns>
        public static bool IsInheritedFrom(this Type type, string fullTypeName)
        {
            while (type != null)
            {
                if (type.FullName.Equals(fullTypeName)) return true;
                type = type.GetTypeInfo().BaseType;
            }
            return false;
        }

        /// <summary>
        /// Determines whether the type is inherited from another type.
        /// </summary>
        /// <param name="type">The type to check the inheritence for.</param>
        /// <param name="baseType">The base type.</param>
        /// <returns><c>true</c> if is inherited from the type; otherwise, <c>false</c>.</returns>
        public static bool IsInheritedFrom(this Type type, Type baseType)
        {
            return IsInheritedFrom(type, baseType.FullName);
        }

        /// <summary>
        /// Determines whether the type is inherited from generic type.
        /// </summary>
        /// <param name="type">The type to check the inheritence for.</param>
        /// <param name="baseType">The base type.</param>
        /// <returns></returns>
        public static bool IsInheritedFromGeneric(this Type type, Type baseType)
        {
            if (!baseType.IsGenericType())
            {
                return false;
            }

            var baseTypeDef = baseType.GetGenericTypeDefinition();

            while (type != null)
            {
                if (type.IsGenericType() && type.GetGenericTypeDefinition() == baseTypeDef)
                    return true;

                type = type.GetTypeInfo().BaseType;
            }
            return false;
        }

        /// <summary>
        /// Checks if the type can be used in columns and conditions
        /// </summary>
        /// <param name="t">The type.</param>
        public static bool IsSimpleType(this Type t)
        {
            return
                t.GetTypeInfo().IsPrimitive ||
                t.GetTypeInfo().IsEnum ||
                t == typeof(string) ||
                t == typeof(Guid) ||
                t == typeof(Guid?) ||
                t == typeof(decimal) ||
                t == typeof(decimal?) ||
                t == typeof(double) ||
                t == typeof(double?) ||
                t == typeof(int?) ||
                t == typeof(short?) ||
                t == typeof(byte?) ||
                t == typeof(long?) ||
                t == typeof(bool?) ||
                t == typeof(DateTime) ||
                t == typeof(DateTime?) ||
                t == typeof(DateTimeOffset) ||
                t == typeof(DateTimeOffset?) ||
                t == typeof(TimeSpan) ||
                t == typeof(TimeSpan?)
                ;
        }

        /// <summary>
        /// Determines whether the specified type is complex type (marked by ComplexType attribute).
        /// </summary>
        /// <param name="typeToCheck">The type to check.</param>
        /// <returns><c>true</c> if the specified type is a complex type; otherwise, <c>false</c>.</returns>
        public static bool IsComplexType(this Type typeToCheck)
        {
            //return Attribute.IsDefined(typeToCheck, typeof(ComplexTypeAttribute))
            var attrs = typeToCheck.GetTypeInfo().GetCustomAttributes();
            foreach (System.Attribute attr in attrs)
            {
                if (attr.GetType().Name == "ComplexTypeAttribute")
                    return true;
            }
            return false;
        }

        /// <summary>
        /// Determines whether the specified type is generic type.
        /// </summary>
        /// <param name="typeToCheck">The type to check.</param>
        /// <returns><c>true</c> if the specified type is a generic type; otherwise, <c>false</c>.</returns>
        public static bool IsGenericType(this Type typeToCheck)
        {
            return typeToCheck.GetTypeInfo().IsGenericType;
        }

        /// <summary>
        /// Determines whether the specified type is an enumeration.
        /// </summary>
        /// <param name="typeToCheck">The type to check.</param>
        /// <returns><c>true</c> if the specified type is a enumeration type; otherwise, <c>false</c>.</returns>
        public static bool IsEnum(this Type typeToCheck)
        {
            return typeToCheck.GetTypeInfo().IsEnum;
        }

        /// <summary>
        /// Determines whether the specified type is a nullable type.
        /// </summary>
        /// <param name="typeToCheck">The type to check.</param>
        /// <returns><c>true</c> if the specified type is a nullable type; otherwise, <c>false</c>.</returns>
        public static bool IsNullable(this Type typeToCheck)
        {
            return typeToCheck.IsGenericType() && typeToCheck.GetGenericTypeDefinition() == typeof(Nullable<>);
        }

        /// <summary>
        /// Determines whether the attribute with specified name is defined for the property.
        /// </summary>
        /// <param name="pi">A PropertyInfo object which defines the property</param>
        /// <param name="attrName">Name of the attribute.</param>
        /// <returns><c>true</c> if "attrName" attribute is defined for "pi" property; otherwise, <c>false</c>.</returns>
        public static bool IsAttributeDefined(this PropertyInfo pi, string attrName)
        {
            var attrs = pi.GetCustomAttributes();
            foreach (System.Attribute attr in attrs)
            {
                Type attrType = attr.GetType();
                if (attrType.Name == attrName)
                    return true;
            }
            return false;
        }


        /// <summary>
        /// Filters the list of properties (defined by source parameter) to return only those which does not have "NotMapped" attribute.
        /// </summary>
        /// <param name="source">The source list of properties.</param>
        /// <returns>IEnumerable&lt;PropertyInfo&gt;.</returns>
        public static IEnumerable<PropertyInfo> GetMappedProperties(this IEnumerable<PropertyInfo> source)
        {
            foreach (PropertyInfo pi in source)
                if (!pi.IsAttributeDefined("NotMappedAttribute"))
                    yield return pi;
        }

        /// <summary>
        /// Determines whether the specified type is enumerable (supports <see cref="T:System.Collections.Generic.IEnumerable"/> interface.
        /// </summary>
        /// <param name="typeToCheck">The type to check.</param>
        /// <returns><c>true</c> if the specified type to check is enumerable; otherwise, <c>false</c>.</returns>
        public static bool IsEnumerable(this Type typeToCheck)
        {

            if (typeToCheck == typeof(IEnumerable)) {
                return true;
            }

            foreach (Type type in typeToCheck.GetInterfaces()) {
                if (type == typeof(IEnumerable) || 
                    (type.GetTypeInfo().IsGenericType && type.GetGenericTypeDefinition() == typeof(IEnumerable<>)))
                    return true;
            }

            return false;
        }
    }
}
