namespace EasyDataBasicDemo.Models;

public class OrderDetail
{
    public int OrderID { get; set; }
    public virtual Order Order { get; set; }

    public int ProductID { get; set; }
    public virtual Product Product { get; set; }

    public decimal UnitPrice { get; set; }

    public short Quantity { get; set; }

    public float Discount { get; set; }
}