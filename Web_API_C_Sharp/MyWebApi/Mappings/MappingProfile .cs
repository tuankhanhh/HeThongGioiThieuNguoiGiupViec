using AutoMapper;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Model;

namespace MyWebApi.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            //Product -> response
            CreateMap<Product, ProductResponse>();
            CreateMap<ProductRequest, Product>();

            CreateMap<Category, CategoryResponse>();
            CreateMap<CategoryRequest, Category>();
        }
    }
}