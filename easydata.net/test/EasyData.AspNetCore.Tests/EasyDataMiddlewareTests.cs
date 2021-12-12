using System;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.IO;
using System.Collections.Generic;


using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using Xunit;
using FluentAssertions;
using FluentAssertions.Json;

namespace EasyData.AspNetCore.Tests
{
    public class EasyDataMiddlewareTests: IClassFixture<EasyDataMiddlewareFixture>
    {
        private readonly IHost _host;

        public EasyDataMiddlewareTests(EasyDataMiddlewareFixture fixture) 
        {
            _host = fixture.GetTestHost();
        }

        [Theory]
        [InlineData("/api/easydata")]
        [InlineData("/api/data")]
        public async Task EasyData_GetModel(string endpoint)
        {
            var client = _host.GetTestClient();
            var response = await client.GetAsync($"{endpoint}/models/__default");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Headers.ContentType
                    .ToString().Should().StartWith("application/json");

            var model = new MetaData();

            var jsonReader = new JsonTextReader(new StreamReader(await response.Content.ReadAsStreamAsync()));
            var responseObj = JObject.Load(jsonReader);

            var modelObj = responseObj.Should().HaveElement("model").Subject;
            modelObj.Should().NotBeNull();

            await model.ReadFromJsonAsync(modelObj.CreateReader(), MetaDataReadWriteOptions.Defaults);

            model.EntityRoot.SubEntities.Should().HaveCount(8)
                .And.Contain((ent) => ent.Id == "Category");
        }

        [Theory]
        [InlineData("/api/easydata", "Customer", 91)]
        [InlineData("/api/data", "Customer", 91)]
        [InlineData("/api/easydata", "Product", 77)]
        [InlineData("/api/data", "Product", 77)]
        public async Task EasyData_GetEntities(string endpoint, string entity, int count)
        {
            var client = _host.GetTestClient();
            var response = await client.PostAsync($"{endpoint}/models/__default/crud/{entity}/fetch", new StringContent("{ \"needTotal\": true }"));

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            response.Content.Headers.ContentType
                    .ToString().Should().StartWith("application/json");

            var jsonReader = new JsonTextReader(new StreamReader(await response.Content.ReadAsStreamAsync()));
            var responseObj = JObject.Load(jsonReader);

            var resultSet = responseObj.Should().HaveElement("resultSet").Subject;
            resultSet.Should().NotBeNull();

            var meta = responseObj.Should().HaveElement("meta").Subject;
            meta.Should().NotBeNull().And
                .HaveElement("totalRecords").Subject
                .ToObject<int>().Should().Be(count);
        }

        [Theory]
        [InlineData("/api/easydata", "Customer", "Id", "ALFKI")]
        [InlineData("/api/data", "Customer", "Id", "ALFKI")]
        [InlineData("/api/easydata", "Product", "Id", "1")]
        [InlineData("/api/data", "Product", "Id", "1")]
        public async Task EasyData_GetEntity(string endpoint, string entity, string keyProperty, string entityId)
        {
            var client = _host.GetTestClient();
            var response = await client.GetAsync($"{endpoint}/models/__default/crud/{entity}/fetch?{keyProperty}={entityId}");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
      
            response.Content.Headers.ContentType
                    .ToString().Should().StartWith("application/json");

            var jsonReader = new JsonTextReader(new StreamReader(await response.Content.ReadAsStreamAsync()));
            var responseObj = JObject.Load(jsonReader);

            var entityObj = responseObj.Should().HaveElement("entity").Subject;
            entityObj.Should().NotBeNull();
        }

        [Theory]
        [MemberData(nameof(GetAddEntityData))]
        public async Task EasyData_AddEntity(string endpoint, string entity, JObject data)
        {
            var client = _host.GetTestClient();
            var content = new StringContent(data.ToString());
            var response = await client.PostAsync($"{endpoint}/models/__default/crud/{entity}/create", content);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            response.Content.Headers.ContentType
                    .ToString().Should().StartWith("application/json");

            var dbContext = _host.Services.GetRequiredService<TestDbContext>();

            if (entity == "Category") {
                var id = data["Id"].ToObject<int>();
                var result = await dbContext.Set<Category>().FindAsync(id);
                result.Should().NotBeNull();
                CompareWithJObject(result, data);
            }
            else if (entity == "Shipper") {
                var id = data["Id"].ToObject<int>();
                var result = await dbContext.Set<Shipper>().FindAsync(id);
                result.Should().NotBeNull();
                CompareWithJObject(result, data);
            }
        }

        private void CompareWithJObject(object obj, JObject jobj)
        {
            foreach (var kv in jobj) {

                var prop = obj.GetType().GetProperty(kv.Key);
                if (prop != null) {
                    prop.GetValue(obj).Should().Be(kv.Value.ToObject(prop.PropertyType));
                }
            }
        }

        public static IEnumerable<object[]> GetAddEntityData()
            => new List<object[]>() {
                new object[] {
                    "/api/easydata", 
                    "Category", 
                    new JObject() { 
                        ["Id"] = 20,
                        ["CategoryName"] = "Test 20"
                    }
                },
                new object[] {
                    "/api/data",
                    "Category",
                    new JObject() {
                        ["Id"] = 40,
                        ["CategoryName"] = "Test 40"
                    }
                },
                new object[] {
                    "/api/easydata",
                    "Shipper",
                    new JObject() {
                        ["Id"] = 20,
                        ["CompanyName"] = "Test 20"
                    }
                },
                new object[] {
                    "/api/easydata",
                    "Shipper",
                    new JObject() {
                        ["Id"] = 40,
                        ["CompanyName"] = "Test 40"
                    }
                }
            };

        [Theory]
        [MemberData(nameof(GetUpdateEntityData))]
        public async Task EasyData_UpdateEntity(string endpoint, string entity, JObject data)
        {
            var client = _host.GetTestClient();
            var content = new StringContent(data.ToString());
            var response = await client.PostAsync($"{endpoint}/models/__default/crud/{entity}/update", content);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            response.Content.Headers.ContentType
                    .ToString().Should().StartWith("application/json");

            var dbContext = _host.Services.GetRequiredService<TestDbContext>();

            if (entity == "Category") {
                var id = data["Id"].ToObject<int>();
                var result = await dbContext.Set<Category>().FindAsync(id);
                result.Should().NotBeNull();
                CompareWithJObject(result, data);
            }
            else if (entity == "Employee") {
                var id = data["Id"].ToObject<int>();
                var result = await dbContext.Set<Employee>().FindAsync(id);
                result.Should().NotBeNull();
                CompareWithJObject(result, data);
            }
        }

        public static IEnumerable<object[]> GetUpdateEntityData()
            => new List<object[]>() {
                new object[] {
                    "/api/easydata",
                    "Category",
                    new JObject() {
                        ["Id"] = 4,
                        ["CategoryName"] = "Test 4"
                    }
                },
                new object[] {
                    "/api/data",
                    "Category",
                    new JObject() {
                        ["Id"] = 5,
                        ["CategoryName"] = "Test 5"
                    }
                },
                new object[] {
                    "/api/easydata",
                    "Employee",
                    new JObject() {
                        ["Id"] = 1,
                        ["LastName"] = "Test 1"
                    }
                },
                new object[] {
                    "/api/easydata",
                    "Employee",
                    new JObject() {
                        ["Id"] = 2,
                        ["LastName"] = "Test 2"
                    }
                }
            };

        [Theory]
        [InlineData("/api/easydata", "Category", "Id", "1")]
        [InlineData("/api/data", "Category", "Id", "2")]
        [InlineData("/api/easydata", "Shipper", "Id", "1")]
        [InlineData("/api/data", "Shipper", "Id", "2")]
        public async Task EasyData_DeleteEntity(string endpoint, string entity, string keyPropery, string entityId)
        {
            var client = _host.GetTestClient();
            var content = new StringContent($"{{\"{keyPropery}\": {entityId}}}");
            var response = await client.PostAsync($"{endpoint}/models/__default/crud/{entity}/delete", content);
            var body = await response.Content.ReadAsStringAsync();
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            response.Content.Headers.ContentType
                    .ToString().Should().StartWith("application/json");

            var dbContext = _host.Services.GetRequiredService<TestDbContext>();

            if (entity == "Category") {
                var result = await dbContext.Set<Category>().FindAsync(int.Parse(entityId));
                result.Should().BeNull();
            }
            else if (entity == "Shipper") {
                var result = await dbContext.Set<Shipper>().FindAsync(int.Parse(entityId));
                result.Should().BeNull();
            }
        }
    }
}
