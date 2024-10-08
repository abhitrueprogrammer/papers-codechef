
// C program to add two polynomials
#include <stdio.h>
#include <stdlib.h>

struct Node
{
    int coeff;
    int pow;
    struct Node *next;
};

struct Node *createNode(int c, int p);

struct Node *addPolynomial(struct Node *head1, struct Node *head2)
{
    struct Node *dummy = createNode(0, 0);

    // Node to append other nodes to the end
    // of list
    struct Node *prev = dummy;
    struct Node *curr1 = head1, *curr2 = head2;

    while (curr1 != NULL && curr2 != NULL)
    {
        // if curr2.pow > curr1.pow, then
        // append curr2 to list

        if (curr1->pow < curr2->pow)
        {
            prev->next = curr2;  // dummy next = curr2
            prev = curr2;        // now make prev as curr2, so after this next for curr2 changes.
            curr2 = curr2->next; // now curr 2 is next value
        }
        // if curr1.pow > curr2.pow, then
        // append curr2 to list
        else if (curr1->pow > curr2->pow)
        {
            prev->next = curr1;
            prev = curr1;
            curr1 = curr1->next;
        }

        // else, add the sum of curr1->coeff and
        // curr2->coeff to curr1->coeff, and append
        // curr1 to the list
        else
        {
            curr1->coeff = curr1->coeff + curr2->coeff;
            prev->next = curr1;
            prev = curr1;
            curr1 = curr1->next;
            curr2 = curr2->next;
        }
    }

    // if curr1 is not null, then append the rest
    // to the list
    if (curr1 != NULL)
    {
        prev->next = curr1;
    }

    // if curr2 is not null, then append the rest
    // to the list
    if (curr2 != NULL)
    {
        prev->next = curr2;
    }

    return dummy->next;
}

void printList(struct Node *head)
{
    struct Node *curr = head;

    while (curr != NULL)
    {
        printf("%d,%d ", curr->coeff, curr->pow);
        curr = curr->next;
    }

    printf("\n");
}

struct Node *createNode(int c, int p)
{
    struct Node *newNode =
        (struct Node *)malloc(sizeof(struct Node));
    newNode->coeff = c;
    newNode->pow = p;
    newNode->next = NULL;
    return newNode;
}

int main()
{

    // 1st polynomial: 5x^2+4x^1+2x^0
    struct Node *head1 = createNode(5, 2);
    head1->next = createNode(4, 1);
    head1->next->next = createNode(2, 0);

    // 2nd polynomial: -5x^1-5x^0
    struct Node *head2 = createNode(-5, 1);
    head2->next = createNode(-5, 0);

    struct Node *head = addPolynomial(head1, head2);

    printList(head);

    return 0;
}
